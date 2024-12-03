import { HttpException, HttpStatus } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { Request } from 'express';

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function extractTokenFromHeader(req: Request): string | null {
  const authorizationHeader = req.headers['authorization'];
  
  if (!authorizationHeader) {
    return null;
  }
  
  const parts = authorizationHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }
  return null;
}

// Decode and verify the token
export function decodeToken(token: string): any {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (error) {
    console.log(error);
    throw new HttpException("Invalid or expired token.", HttpStatus.UNAUTHORIZED);
  }
}
