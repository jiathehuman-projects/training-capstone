import * as jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import * as dotenv from "dotenv";
import { requireSecret } from "../utils/helper";
import { JwtPayload } from "jsonwebtoken";
dotenv.config();

// Extend Express Request interface to include currentUser
declare global {
  namespace Express {
    interface Request {
      currentUser?: string | JwtPayload;
    }
  }
}

// updated from last submission
const secret = requireSecret()

export const authentication = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "Unauthorised" });
  const token = header.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorised" });
  // jwt.verify checks for ssignature, if token has expired, if token is indented for audience
  const decode = jwt.verify(token, secret);
  req["currentUser"] = decode; // attaching userinfo
  next();
};