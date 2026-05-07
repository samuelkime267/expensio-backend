import { hashKey } from "@/lib/encryption";
import crypto from "crypto";

export const generateOtp = (options = { expiresInMinutes: 10, length: 6 }) => {
  const { expiresInMinutes, length } = options;

  const max = 10 ** length;

  const otp = crypto.randomInt(0, max).toString().padStart(length, "0");
  const hashedOtp = hashKey(otp);

  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

  return {
    otp,
    hashedOtp,
    expiresAt,
  };
};
