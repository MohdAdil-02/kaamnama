import { connectDB, disconnectDB } from "../config/database.js";
import { expireStaleReceipts } from "./notification.job.js";
import { recomputeAllTrustScores } from "./trustScore.job.js";

const JOBS = { expire: expireStaleReceipts, trust: recomputeAllTrustScores };
const name = process.argv[2];

if (!JOBS[name]) {
  console.error(`Usage: node src/jobs/run.js <${Object.keys(JOBS).join("|")}>`);
  process.exit(1);
}

await connectDB();
const result = await JOBS[name]();
console.log(`✅ Job "${name}" finished:`, result);
await disconnectDB();
process.exit(0);