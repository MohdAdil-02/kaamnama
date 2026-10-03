export const RECEIPT_STATUS = Object.freeze({
  PENDING: "pending",       // created by worker, waiting for customer
  VERIFIED: "verified",     // customer confirmed
  DISPUTED: "disputed",     // customer raised issue
  REJECTED: "rejected",     // customer denied
  EXPIRED: "expired",       // no response in time
});

export const VERIFICATION_METHOD = Object.freeze({
  OTP: "otp",
  QR: "qr",
  LINK: "link",
});

export const OTP_PURPOSE = Object.freeze({
  LOGIN: "login",
  REGISTER: "register",
  RECEIPT_VERIFY: "receipt_verify",
});

export const ACCOUNT_STATUS = Object.freeze({
  ACTIVE: "active",
  SUSPENDED: "suspended",
  DELETED: "deleted",
});

export const NOTIFICATION_TYPE = Object.freeze({
  RECEIPT_CREATED: "receipt_created",
  RECEIPT_VERIFIED: "receipt_verified",
  RECEIPT_DISPUTED: "receipt_disputed",
  RATING_RECEIVED: "rating_received",
  TIER_UPGRADED: "tier_upgraded",
  ORG_INVITE: "org_invite",
  SYSTEM: "system",
});