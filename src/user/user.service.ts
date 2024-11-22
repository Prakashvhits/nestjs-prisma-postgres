import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service"; // Replace with your PrismaService path
import { UserDto } from "./dto/user.dto"; // Replace with the actual path to your DTO

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  async createUser(payload: UserDto): Promise<any> {
    const { id, userName, email, password, phoneNumber } = payload;
    // Validate required fields
    if (!userName || !email || !password || !phoneNumber) {
      throw new HttpException(
        "All fields (userName, email, password, phoneNumber) are required.",
        HttpStatus.BAD_REQUEST
      );
    }
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ userName }, { email }, { phoneNumber }]
      }
    });

    if (existingUser) {
      const conflictField =
        existingUser.userName === userName
          ? "User name"
          : existingUser.email === email
            ? "Email address"
            : "Phone number";

      throw new HttpException(`${conflictField} already exists.`, HttpStatus.CONFLICT);
    }
    if (id) {
      return this.updateUser(id, payload);
    } else {
      // Insert new user
      return this.prisma.user.create({
        data: {
          userName,
          email,
          password,
          phoneNumber
        }
      });
    }
  }

  private async updateUser(id: string, payload: UserDto): Promise<any> {
    const { userName, email, password, phoneNumber } = payload;

    const existingUser = await this.prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      throw new HttpException("User not found.", HttpStatus.NOT_FOUND);
    }
    // Update user
    return this.prisma.user.update({
      where: { id },
      data: {
        userName,
        email,
        password,
        phoneNumber
      }
    });
  }
}
