import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = 10;

export const requireSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return secret;
}

export const requireAPIKey = () => {
    const secret = process.env.API_KEY;
  if (!secret) throw new Error("API KEY is not set");
  return secret;
}

export const encrypt_password = (plain: string) => bcrypt.hash(plain, SALT_ROUNDS)

export const compare_password = (plain: string, hash: string) => bcrypt.compare(plain, hash)

export const generateToken = (payload: object) =>
jwt.sign(payload, requireSecret(), { expiresIn: "7d" })