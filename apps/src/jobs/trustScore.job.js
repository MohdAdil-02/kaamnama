import Worker from "../models/Worker.js";
import { recomputeTrustScore } from "../services/trustScore.service.js";

export const recomputeAllTrustScores = async () => {
  let processed = 0;
  let upgraded = 0;
  let failed = 0;

  // Cursor keeps memory flat however many workers there are
  for await (const { _id } of Worker.find().select("_id").lean().cursor()) {
    try {
      const result = await recomputeTrustScore(_id);
      processed++;
      if (result?.upgraded) upgraded++;
    } catch (err) {
      failed++;
      console.error(`Trust recompute failed for ${_id}:`, err.message);
    }
  }

  return { processed, upgraded, failed };
};