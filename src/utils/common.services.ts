import { HttpException, HttpStatus } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import * as fs from "fs";
import * as crypto from 'crypto';
import { Request } from 'express';
import * as sharp from "sharp";
// import * as path from "path";

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

const ALGORITHM = "aes-256-cbc";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

export async function encryptFile(inputPath: string, outputPath: string): Promise<void> {
  
  const iv = crypto.randomBytes(16); 

  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);

  const input = fs.createReadStream(inputPath);
  const output = fs.createWriteStream(outputPath);


  
  output.write(iv); 

  input.pipe(cipher).pipe(output);

}

// Decrypt the file
export function decryptFile(inputPath: string, outputPath: string): void {
  const input = fs.createReadStream(inputPath);
  const output = fs.createWriteStream(outputPath);

  input.once('data', (data) => {
    const iv = data.slice(0, 16); // Extract IV from the start of the file
    const decipher = crypto.createDecipheriv(process.env.ALGORITHM, Buffer.from(process.env.ENCRYPTION_KEY, 'utf-8'), iv);

    const restStream = input.pipe(decipher);
    restStream.pipe(output);
  });
}
