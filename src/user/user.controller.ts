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
  UploadedFile,
  UseInterceptors
} from "@nestjs/common";
import { UserService } from "./user.service";
import { uploadDoucumentDto, UploadUserProfileImageDto, UserDto } from "./dto/user.dto";
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AnyFilesInterceptor, FileInterceptor } from "@nestjs/platform-express";
import * as multer from "multer";
import { extname } from "path";

@Controller("user")
export class UserController {
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
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
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
  async uploadProfileImage(@Body() body: UploadUserProfileImageDto, @UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new HttpException("No file uploaded.", HttpStatus.BAD_REQUEST);
      }
      const filename = file.filename;
      const id = body.id;
      return await this.userService.uploadProfileImage(id, filename);
    } catch (error) {
      throw new HttpException(
        { message: "Failed to upload profile image", error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
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
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        }
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|pdf|doc|docx)$/)) {
          return callback(new BadRequestException("Only image files are allowed!"), false);
        }
        callback(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }
    })
  )
  async uploadDocument(@Body() body: uploadDoucumentDto, @UploadedFile() files: Express.Multer.File[]) {
    try {
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
      throw new HttpException(
        { message: "Failed to upload document", error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
