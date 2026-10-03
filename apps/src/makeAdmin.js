import { connectDB, disconnectDB } from "./config/database.js";
import User from "./models/User.js";
import Worker from "./models/Worker.js";
import { normalizePhone } from "./utils/phone.js";
import { ROLES } from "./constants/roles.js";
import { ACCOUNT_STATUS } from "./constants/statuses.js";

const [, , rawPhone, ...nameParts] = process.argv;

if (!rawPhone) {
  console.error('Usage: npm run make-admin -- 9812345679 "Admin Name"');
  process.exit(1);
}

const phone = normalizePhone(rawPhone);
const name = nameParts.join(" ") || "Admin";

await connectDB();

const existing = await User.findOne({ phone });
if (existing && (await Worker.exists({ user: existing._id }))) {
  console.error("❌ That number belongs to a worker account. Use a different number for the admin.");
  await disconnectDB();
  process.exit(1);
}

await User.updateOne(
  { phone },
  {
    $set: { role: ROLES.ADMIN, status: ACCOUNT_STATUS.ACTIVE, isPhoneVerified: true },
    $setOnInsert: { name },
  },
  { upsert: true }
);

console.log(`✅ ${phone} is now an admin. Log in with OTP as usual (no name or role needed).`);
await disconnectDB();
process.exit(0);