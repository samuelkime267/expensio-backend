import { Types } from "mongoose";
import {
  JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  JWT_SECRET,
} from "../config/env";
import jwt from "jsonwebtoken";

// overloads
export function generateJwtToken(
  _id: string | Types.ObjectId,
  onlyAccess: true,
): { accessToken: string };

export function generateJwtToken(
  _id: string | Types.ObjectId,
  onlyAccess?: false,
): { accessToken: string; refreshToken: string };

// implementation
export function generateJwtToken(
  _id: string | Types.ObjectId,
  onlyAccess = false,
) {
  if (typeof _id !== "string") _id = _id.toString();

  const payload = { id: _id };

  const accessToken = jwt.sign({ ...payload, type: "access" }, JWT_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRES_IN,
  });

  if (onlyAccess) {
    return { accessToken };
  }

  const refreshToken = jwt.sign({ ...payload, type: "refresh" }, JWT_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });

  return {
    accessToken,
    refreshToken,
  };
}
