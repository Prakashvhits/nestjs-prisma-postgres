import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service"; // Replace with your PrismaService path
import { RegisterUserDto } from "./dto/create-authentication.dto"; // Replace with the actual path to your DTO
import { JwtService } from "@nestjs/jwt";
import { comparePassword, hashPassword } from "src/utils/common.services";
@Injectable()
export class AuthenticationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async createUser(payload: RegisterUserDto): Promise<any> {
    const { id, userName, email, password, phoneNumber, fullName } = payload;

    // Validate required fields
    if (!userName || !email || !password || !phoneNumber) {
      throw new HttpException(
        "All fields (userName, email, password, phoneNumber) are required.",
        HttpStatus.BAD_REQUEST
      );
    }

    // Check for existing user conflicts
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

    // Encrypt the password
    const encryptedPassword = await hashPassword(password);

    if (id) {
      return this.updateUser(id, { ...payload, password: encryptedPassword });
    } else {
      // Create a new user
      return this.prisma.user.create({
        data: {
          userName,
          email,
          password: encryptedPassword,
          phoneNumber,
          fullName
        }
      });
    }
  }

  private async updateUser(id: string, payload: RegisterUserDto): Promise<any> {
    const { userName, email, password, phoneNumber } = payload;

    // Find the user to be updated
    const existingUser = await this.prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      throw new HttpException("User not found.", HttpStatus.NOT_FOUND);
    }

    // Check for conflicts with other users
    const conflictingUser = await this.prisma.user.findFirst({
      where: {
        AND: [
          { id: { not: id } }, // Exclude the current user
          {
            OR: [
              userName ? { userName } : undefined,
              email ? { email } : undefined,
              phoneNumber ? { phoneNumber } : undefined
            ]
          }
        ]
      }
    });

    if (conflictingUser) {
      const conflictField =
        conflictingUser.userName === userName
          ? "User name"
          : conflictingUser.email === email
            ? "Email address"
            : "Phone number";

      throw new HttpException(`${conflictField} already exists.`, HttpStatus.CONFLICT);
    }

    // Encrypt the password if provided
    let encryptedPassword = undefined;
    if (password) {
      encryptedPassword = await hashPassword(password);
    }

    // Update user with provided fields
    const updatedData: any = {
      ...(userName && { userName }),
      ...(email && { email }),
      ...(encryptedPassword && { password: encryptedPassword }),
      ...(phoneNumber && { phoneNumber })
    };

    return this.prisma.user.update({
      where: { id },
      data: updatedData
    });
  }

  async loginUser(loginInput: { identifier: string; password: string }): Promise<any> {
    const { identifier, password } = loginInput;

    // Find user by email, username, or phone
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { userName: identifier }, { phoneNumber: identifier }]
      }
    });

    if (!user) {
      throw new HttpException("User not found.", HttpStatus.NOT_FOUND);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new HttpException("Invalid password.", HttpStatus.UNAUTHORIZED);
    }

    // Generate access and refresh tokens
    const tokens = this.generateTokens(user.id);
    return {
      // user,
      ...tokens
    };
  }

  private generateTokens(userId: string) {
    const payload = { userId };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: "15m"
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: "7d"
    });

    return { accessToken, refreshToken };
  }
}
