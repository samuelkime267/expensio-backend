import dotenv from "dotenv";

dotenv.config();

export const PORT = Number(process.env.PORT) || 2607;
export const NODE_ENV = process.env.NODE_ENV || "development";
export const MONGO_URL = process.env.MONGO_URL || "";
export const JWT_SECRET = process.env.JWT_SECRET || "overlysecretsomething";
export const JWT_ACCESS_EXPIRES_IN = (process.env.JWT_ACCESS_EXPIRES_IN ||
  "5m") as `${number}`;
export const JWT_REFRESH_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN ||
  "30d") as `${number}`;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

export const SMTP_HOST = process.env.SMTP_HOST || "";
export const SMTP_PORT = Number(process.env.SMTP_PORT || 0);
export const SMTP_USER = process.env.SMTP_USER || "";
export const SMTP_PASS = process.env.SMTP_PASS || "";

export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
export const STREAM_KEY_SECRET =
  process.env.STREAM_KEY_SECRET || "supersecret32characterslength!!";

export const HASH_SECRET = process.env.HASH_SECRET || "supersecrethash";
