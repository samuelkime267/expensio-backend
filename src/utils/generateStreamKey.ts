import crypto from "crypto";
import { encrypt, hashKey } from "@/lib/encryption";

export function generateStreamKey() {
  const randomPart = crypto.randomBytes(24).toString("hex");
  const streamKey = `rivo_live_${randomPart}`;

  const encryptedStreamKey = encrypt(streamKey);
  const hashedStreamKey = hashKey(streamKey);

  return { streamKey, encryptedStreamKey, hashedStreamKey };
}
