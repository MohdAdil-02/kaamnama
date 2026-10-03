import QRCode from "qrcode";
import env from "../config/environment.js";

// The React app will serve /verify/:token and call the public API with it.
export const buildVerifyUrl = (token) => {
  const base = env.CLIENT_URL.split(",")[0].trim().replace(/\/+$/, "");
  return `${base}/verify/${token}`;
};

// Returns a PNG data URL, ready for <img src="...">
export const generateQr = (text) =>
  QRCode.toDataURL(text, { errorCorrectionLevel: "M", margin: 2, width: 400 });