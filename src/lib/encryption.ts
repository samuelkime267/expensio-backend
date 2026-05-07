import crypto from "crypto";
import { STREAM_KEY_SECRET, HASH_SECRET } from "@/config/env";

const algorithm = "aes-256-gcm";
const key = crypto.scryptSync(STREAM_KEY_SECRET, "salt", 32);
const ivLength = 12;

export function encrypt(text: string) {
  const iv = crypto.randomBytes(ivLength);

  const cipher = crypto.createCipheriv(algorithm, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    iv.toString("base64"),
    authTag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
}

export function decrypt(data: string) {
  const parts = data.split(":");

  if (parts.length !== 3) {
    throw new Error("Malformed encrypted payload");
  }

  const [ivB64, authTagB64, encryptedB64] = parts;

  const iv = Buffer.from(ivB64, "base64");
  const authTag = Buffer.from(authTagB64, "base64");
  const encrypted = Buffer.from(encryptedB64, "base64");

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

export function hashKey(key: string) {
  return crypto.createHmac("sha256", HASH_SECRET).update(key).digest("hex");
}
