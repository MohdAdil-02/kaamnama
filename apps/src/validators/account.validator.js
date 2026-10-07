import { z } from "zod";

export const deleteAccountSchema = z.object({
  otp: z.string().trim().regex(/^\d{4,8}$/, "OTP must be numeric"),
  confirm: z.literal("DELETE", {
    errorMap: () => ({ message: 'Type "DELETE" to confirm' }),
  }),
});