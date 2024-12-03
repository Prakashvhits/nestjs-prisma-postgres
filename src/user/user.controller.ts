import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Query,
  Req,
  UploadedFile,
  UploadedFiles,
  UseInterceptors
} from "@nestjs/common";
import { UserService } from "./user.service";
import { uploadDoucumentDto, UploadUserProfileImageDto, UserDto } from "./dto/user.dto";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AnyFilesInterceptor, FileInterceptor } from "@nestjs/platform-express";
import * as multer from "multer";
import * as path from "path";
import * as sharp from "sharp";
import * as fs from "fs";
// import * as jwt from "jsonwebtoken";
import { Request } from 'express';
import * as dotenv from "dotenv";
import { decodeToken, extractTokenFromHeader } from "src/utils/common.services";

dotenv.config();
@Controller("user")
export class UserController {
  [x: string]: any;
  constructor(private userService: UserService) {}

  @Post("get_all_user_details")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get all user details" })
  @ApiResponse({ status: 200, description: "User details fetched successfully" })
  async getAllUsers(@Body() body: UserDto) {
    const { filters, page = 1, limit = 10, search } = body;

    try {
      const validLimit = Math.max(limit, 1);
      const validPage = Math.max(page, 1);
      return await this.userService.getAllUsers({
        filters,
        page: validPage,
        limit: validLimit,
        search
      });
    } catch (error) {
      throw new HttpException(
        { message: "Failed to fetch user details", error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("get_user_details")
  @ApiOperation({ summary: "Get user details by id" })
  @ApiResponse({ status: 200, description: "User details fetched successfully" })
  async getUserById(@Query("id") id: string) {
    // Pass 'id' as a query parameter
    try {
      return await this.userService.getUserById(id);
    } catch (error) {
      throw new HttpException(
        { message: "Failed to fetch user details", error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  @Post("upload_profile_image")
  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Upload profile image" })
  @ApiResponse({ status: 200, description: "Profile image uploaded successfully" })
  @ApiBody({
    description: "User ID and file to be uploaded",
    schema: {
      type: "object",
      properties: {
        id: { type: "string", description: "User ID" },
        file: {
          type: "string",
          format: "binary",
          description: "Profile image file"
        }
      }
    }
  })
  @UseInterceptors(
    FileInterceptor("file", {
      storage: multer.diskStorage({
        destination: "./uploads",
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 999999);
          callback(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
        }
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
          return callback(new BadRequestException("Only image files are allowed!"), false);
        }
        callback(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }
    })
  )
  async uploadProfileImage(@Body() body: UploadUserProfileImageDto, @Req() req: Request, @UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new HttpException("No file uploaded.", HttpStatus.BAD_REQUEST);
      }
      const outputDir = path.join(process.cwd(), "uploads");
      const filePath = path.join(outputDir, file.filename);
      const filename = file.filename;
      // const compressedImageBuffer = await sharp(file.path).resize(200, 200).toBuffer();
      const compressedImageBuffer = await this.compressImageToMaxSize(file.path, 250 * 1024);
      fs.writeFileSync(filePath, compressedImageBuffer);
      const token = extractTokenFromHeader(req);   
      const decoded = decodeToken(token);
        
      const userId = decoded.userId;
      const id = userId;
      // const id = body.id;
      return await this.userService.uploadProfileImage(id, filename);
    } catch (error) {
      console.log(error);
      throw new HttpException(
        { message: "Failed to upload profile image", error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  
 
private async compressImageToMaxSize(filePath: string, maxSize: number): Promise<Buffer> {
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

  @Post("upload_document")
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Upload document" })
  @ApiResponse({ status: 200, description: "Document uploaded successfully" })
  @ApiBody({
    description: "Documents to be uploaded",
    schema: {
      type: "object",
      properties: {
        id: { type: "string", description: "User ID" },
        aadharCard: {
          type: "string",
          format: "binary",
          description: "Aadhar card document file"
        },
        panCard: {
          type: "string",
          format: "binary",
          description: "Pan card document file"
        },
        passport: {
          type: "string",
          format: "binary",
          description: "Passport document file"
        }
      }
    }
  })
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: multer.diskStorage({
        destination: "./uploads/documents",
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 999999);
          callback(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
        }
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|pdf|doc|docx|XLS|XLSX)$/)) {
          return callback(new BadRequestException("Only image files are allowed!"), false);
        }
        callback(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }
    })
  )
  async uploadDocument(@Body() body: uploadDoucumentDto, @UploadedFiles() files: Express.Multer.File[]) {
    try {
      console.log(files, "files");
      if (!files) {
        throw new HttpException("No file uploaded.", HttpStatus.BAD_REQUEST);
      }
      const userDetails = await this.userService.getUserById(body.id);
      if (!userDetails) {
        throw new HttpException("User not found", HttpStatus.NOT_FOUND);
      }
      const documents = [];
      for (const doc of files) {
        let docType = "";
        switch (doc.fieldname) {
          case "aadharCard":
            docType = "aadharCard";
            break;
          case "panCard":
            docType = "panCard";
            break;
          case "passport":
            docType = "passport";
            break;
          default:
            docType = "unknown document";
        }
        const filename = doc.filename;
        const userId = body.id;
        const title = docType;
        const username = userDetails.userName;
        const fieldname = doc.fieldname;
        documents.push({ userId, title, filename, username, fieldname });
      }

      await this.userService.UploadDocument(documents);
      return { message: "Document uploaded successfully", data: documents };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        { message: "Failed to upload document", error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}




