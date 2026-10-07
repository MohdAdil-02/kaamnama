import crypto from "crypto";
import JobReceipt from "../models/JobReceipt.js";
import Category from "../models/Category.js";
import User from "../models/User.js";
import VerificationEvent from "../models/VerificationEvent.js";
import AppError from "../utils/AppError.js";
import { RECEIPT_STATUS, VERIFICATION_METHOD, NOTIFICATION_TYPE } from "../constants/statuses.js";
import { generateToken, sha256 } from "../utils/hash.js";
import { getPagination, buildPaginationMeta } from "../utils/pagination.js";
import { maskPhone } from "../utils/phone.js";
import { sendSms } from "../config/sms.js";
import { uploadImageBuffer } from "./upload.service.js";
import { buildVerifyUrl, generateQr } from "./qr.service.js";
import { loadWorker } from "./profile.service.js";
import { notify } from "./notification.service.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const RECEIPT_TTL_DAYS = 7;
const MAX_RECEIPTS_PER_DAY = 30;
const MAX_PENDING_PER_CUSTOMER = 3;
const MAX_LINK_SMS_PER_RECEIPT = 3;
const MAX_PHOTOS = 5;

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const randomId = (len) =>
  Array.from(crypto.randomBytes(len), (b) => ALPHABET[b % ALPHABET.length]).join("");

const newReceiptNumber = () =>
  `KN-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${randomId(6)}`;

const issueVerification = async (receipt) => {
  const token = generateToken(24);
  await JobReceipt.updateOne({ _id: receipt._id }, { verifyTokenHash: sha256(token) });
  const url = buildVerifyUrl(token);
  const qrDataUrl = await generateQr(url);
  return { token, url, qrDataUrl, expiresAt: receipt.expiresAt };
};

const getOwnedPending = async (userId, id) => {
  const receipt = await JobReceipt.findOne({ _id: id, workerUser: userId });
  if (!receipt) throw AppError.notFound("Receipt not found");
  if (receipt.status !== RECEIPT_STATUS.PENDING) {
    throw AppError.badRequest(`This receipt is already ${receipt.status}`);
  }
  if (receipt.expiresAt && receipt.expiresAt < new Date()) {
    throw AppError.badRequest("This receipt has expired. Create a new one");
  }
  return receipt;
};

export const createReceipt = async (user, data, meta) => {
  const worker = await loadWorker(user._id);

  if (data.customerPhone === user.phone) {
    throw AppError.badRequest("You cannot create a receipt for your own phone number");
  }

  const categoryOk = await Category.exists({ _id: data.category, isActive: true });
  if (!categoryOk) throw AppError.badRequest("Invalid category");

  const [createdToday, pendingForCustomer] = await Promise.all([
    JobReceipt.countDocuments({ worker: worker._id, createdAt: { $gte: new Date(Date.now() - DAY_MS) } }),
    JobReceipt.countDocuments({
      worker: worker._id,
      customerPhone: data.customerPhone,
      status: RECEIPT_STATUS.PENDING,
    }),
  ]);
  if (createdToday >= MAX_RECEIPTS_PER_DAY) {
    throw AppError.tooMany("Daily receipt limit reached. Try again tomorrow");
  }
  if (pendingForCustomer >= MAX_PENDING_PER_CUSTOMER) {
    throw AppError.conflict("This customer already has pending receipts from you. Wait for them to confirm");
  }

  const customerUser = await User.findOne({ phone: data.customerPhone }).select("_id");

  let receipt;
  for (let attempt = 0; attempt < 5 && !receipt; attempt++) {
    try {
      receipt = await JobReceipt.create({
        receiptNumber: newReceiptNumber(),
        worker: worker._id,
        workerUser: user._id,
        customerPhone: data.customerPhone,
        customerName: data.customerName,
        customerUser: customerUser ? customerUser._id : null,
        category: data.category,
        title: data.title,
        description: data.description,
        amount: data.amount,
        workDate: data.workDate,
        address: data.address,
        city: data.city || worker.city,
        expiresAt: new Date(Date.now() + RECEIPT_TTL_DAYS * DAY_MS),
      });
    } catch (err) {
      const isNumberClash = err.code === 11000 && err.keyPattern?.receiptNumber;
      if (!isNumberClash) throw err;
    }
  }
  if (!receipt) throw new AppError("Could not generate a receipt number. Please try again", 500);

  await VerificationEvent.create({
    receipt: receipt._id,
    type: "created",
    actorUser: user._id,
    ip: meta.ip,
    userAgent: meta.userAgent,
  });

  const verification = await issueVerification(receipt);

  // If the customer already has an account, let them know a job is waiting
  if (customerUser) {
    await notify(customerUser._id, {
      type: NOTIFICATION_TYPE.RECEIPT_CREATED,
      title: "New job to confirm",
      body: `${worker.displayName} logged "${receipt.title}" for you. Confirm it using the link they share.`,
      data: { receiptId: receipt._id },
    });
  }

  return { receipt, verification };
};

export const listMyReceipts = async (userId, query) => {
  const worker = await loadWorker(userId);
  const { page, limit, skip } = getPagination(query);

  const filter = { worker: worker._id };
  if (query.status) filter.status = query.status;

  const [items, total] = await Promise.all([
    JobReceipt.find(filter)
      .populate("category", "name slug")
      .sort({ workDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    JobReceipt.countDocuments(filter),
  ]);

  return { items, meta: buildPaginationMeta({ total, page, limit }) };
};

export const getMyReceipt = async (userId, id) => {
  const receipt = await JobReceipt.findOne({ _id: id, workerUser: userId })
    .populate("category", "name slug")
    .lean();
  if (!receipt) throw AppError.notFound("Receipt not found");

  const events = await VerificationEvent.find({ receipt: id })
    .sort({ createdAt: 1 })
    .select("type method createdAt -_id")
    .lean();

  return { receipt, events };
};

export const refreshQr = async (userId, id) => {
  const receipt = await getOwnedPending(userId, id);
  return issueVerification(receipt);
};

export const sendLinkToCustomer = async (user, id, meta) => {
  const receipt = await getOwnedPending(user._id, id);

  const sent = await VerificationEvent.countDocuments({ receipt: receipt._id, type: "resent" });
  if (sent >= MAX_LINK_SMS_PER_RECEIPT) {
    throw AppError.tooMany("Link already sent the maximum number of times for this receipt");
  }

  const worker = await loadWorker(user._id);
  const { url } = await issueVerification(receipt);

    await sendSms(receipt.customerPhone, "receipt_link", {
    worker: worker.displayName,
    job: receipt.title,
    link: url,
  });

  await VerificationEvent.create({
    receipt: receipt._id,
    type: "resent",
    method: VERIFICATION_METHOD.LINK,
    actorUser: user._id,
    ip: meta.ip,
    userAgent: meta.userAgent,
  });

  return { sentTo: maskPhone(receipt.customerPhone) };
};

export const addPhotos = async (userId, id, files) => {
  if (!files || files.length === 0) {
    throw AppError.badRequest("Select at least one image (form field name: photos)");
  }
  const receipt = await getOwnedPending(userId, id);

  if (receipt.photos.length + files.length > MAX_PHOTOS) {
    throw AppError.badRequest(`A receipt can have at most ${MAX_PHOTOS} photos`);
  }

  const uploaded = [];
  for (const file of files) {
    uploaded.push(await uploadImageBuffer(file.buffer, { folder: "kaamnama/receipts" }));
  }

  receipt.photos.push(...uploaded.map((u) => ({ url: u.url, publicId: u.publicId })));
  await receipt.save();
  return { photos: receipt.photos };
};