import { HttpException, HttpStatus } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { Request } from 'express';
import * as sharp from "sharp";

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

export async function compressImageToMaxSize(filePath: string, maxSize: number): Promise<Buffer> {
  let buffer = await sharp(filePath).toBuffer();
  const metadata = await sharp(buffer).metadata(); 

  if (!metadata.width || !metadata.height) {
      throw new HttpException(
          "Unable to read image dimensions.",
          HttpStatus.BAD_REQUEST
      );
  }

  let width = metadata.width; 

  // Iteratively resize the image until it meets the size requirement
  while (buffer.length > maxSize) {
      width = Math.floor(width * 0.9); // Reduce width by 10%
      buffer = await sharp(filePath)
          .resize({ width })
          .toBuffer(); 

      // Stop resizing if width becomes unreasonably small
      if (width < 100) {
          throw new HttpException(
              "Cannot reduce image to the desired size without significant quality loss.",
              HttpStatus.BAD_REQUEST
          );
      }
  }

  return buffer;
}
