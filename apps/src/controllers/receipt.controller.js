import asyncHandler from "../utils/asyncHandler.js";
import * as receiptService from "../services/receipt.service.js";
import * as verificationService from "../services/verification.service.js";

const meta = (req) => ({ ip: req.ip, userAgent: req.headers["user-agent"] });

// ---------- Worker ----------
export const createReceipt = asyncHandler(async (req, res) => {
  const { receipt, verification } = await receiptService.createReceipt(req.user, req.body, meta(req));
  res.status(201).json({
    success: true,
    message: "Receipt created. Ask the customer to scan the QR or open the link",
    data: { receipt, verification },
  });
});

export const listReceipts = asyncHandler(async (req, res) => {
  const { items, meta: pagination } = await receiptService.listMyReceipts(req.user._id, req.query);
  res.json({ success: true, data: { receipts: items }, meta: pagination });
});

export const getReceipt = asyncHandler(async (req, res) => {
  const data = await receiptService.getMyReceipt(req.user._id, req.params.id);
  res.json({ success: true, data });
});

export const refreshQr = asyncHandler(async (req, res) => {
  const verification = await receiptService.refreshQr(req.user._id, req.params.id);
  res.json({ success: true, message: "New QR generated. The previous link no longer works", data: { verification } });
});

export const sendLink = asyncHandler(async (req, res) => {
  const data = await receiptService.sendLinkToCustomer(req.user, req.params.id, meta(req));
  res.json({ success: true, message: "Link sent to customer", data });
});

export const uploadPhotos = asyncHandler(async (req, res) => {
  const data = await receiptService.addPhotos(req.user._id, req.params.id, req.files);
  res.json({ success: true, message: "Photos added", data });
});

// ---------- Public (customer, via token) ----------
export const previewByToken = asyncHandler(async (req, res) => {
  const receipt = await verificationService.getPreview(req.params.token);
  res.json({ success: true, data: { receipt } });
});

export const sendReceiptOtp = asyncHandler(async (req, res) => {
  const data = await verificationService.sendVerificationOtp(req.params.token, meta(req));
  res.json({ success: true, message: "OTP sent to the customer's phone", data });
});

export const confirmReceipt = asyncHandler(async (req, res) => {
  const data = await verificationService.confirmReceipt(req.params.token, req.body, meta(req));
  res.json({ success: true, message: data.message, data });
});