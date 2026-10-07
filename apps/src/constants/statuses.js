export const RECEIPT_STATUS = Object.freeze({
  PENDING: "pending",
  VERIFIED: "verified",
  DISPUTED: "disputed",
  REJECTED: "rejected",
  EXPIRED: "expired",
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
  ACCOUNT_DELETE: "account_delete",
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
  RECEIPT_REJECTED: "receipt_rejected",
  RECEIPT_EXPIRED: "receipt_expired",
  RATING_RECEIVED: "rating_received",
  TIER_UPGRADED: "tier_upgraded",
  ORG_INVITE: "org_invite",
  SYSTEM: "system",
});