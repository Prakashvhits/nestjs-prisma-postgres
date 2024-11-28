import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UserDto } from "./dto/user.dto";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllUsers(options: UserDto) {
    try {
      const { filters = {}, search } = options;

      const page = options.page || 1;
      const limit = options.limit || 10;

      const whereCondition: any = { ...filters };

      if (search) {
        whereCondition.OR = [
          { fullName: { contains: search, mode: "insensitive" } },
          { userName: { contains: search, mode: "insensitive" } },
          { phoneNumber: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } }
        ];
      }

      const total = await this.prisma.user.count({ where: whereCondition });

      const users = await this.prisma.user.findMany({
        where: whereCondition,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" }
      });

      return {
        data: users,
        total,
        page,
        limit
      };
    } catch (error) {
      console.error("Error fetching user details:", error);
      throw new HttpException(
        { message: "Failed to fetch user details", error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  async getUserById(id: string) {
    console.log(id);
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) {
        throw new HttpException("User not found.", HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      console.error("Error fetching user details:", error);
      throw new HttpException(
        { message: "Failed to fetch user details", error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
  async uploadProfileImage(id: string, profileImage: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: id } });
      if (!user) {
        throw new HttpException("User not found.", HttpStatus.NOT_FOUND);
      }
      console.log(profileImage, id);

      const updatedUser = await this.prisma.user.update({
        where: { id: id },
        data: { profileImage }
      });

      return updatedUser;
    } catch (error) {
      console.error("Error uploading profile image:", error);
      throw new HttpException(
        { message: "Failed to upload profile image", error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async UploadDocument(documents: { userId: string; title: string; filename: string; username: string }[]) {
    return await this.prisma.document.createMany({
      data: documents.map(doc => ({
        userId: doc.userId,
        title: doc.title,
        filename: doc.filename,
        username: doc.username
      }))
    });
  }
}
