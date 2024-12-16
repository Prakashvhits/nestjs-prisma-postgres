import { Injectable, HttpException, HttpStatus, Res,  } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service"; // Replace with your PrismaService path
import { LoginDto, RegisterUserDto, ResetPasswordDto } from "./dto/create-authentication.dto"; // Replace with the actual path to your DTO
import { JwtService } from "@nestjs/jwt";
import { comparePassword, hashPassword } from "src/utils/common.services";
import { Response } from "express";

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  // async createUser(payload: RegisterUserDto): Promise<any> {
  //   const { id, userName, email, password, phoneNumber, fullName } = payload;

  //   // Validate required fields
  //   if (!userName || !email || !password || !phoneNumber) {
  //     throw new HttpException(
  //       "All fields (userName, email, password, phoneNumber) are required.",
  //       HttpStatus.BAD_REQUEST
  //     );
  //   }

  //   // Check for existing user conflicts
  //   const existingUser = await this.prisma.user.findFirst({
  //     where: {
  //       OR: [{ userName }, { email }, { phoneNumber }]
  //     }
  //   });

  //   if (existingUser && !existingUser === null) {
  //     const conflictField =
  //       existingUser.userName === userName
  //         ? "User name"
  //         : existingUser.email === email
  //           ? "Email address"
  //           : "Phone number";

  //     throw new HttpException(`${conflictField} already exists.`, HttpStatus.CONFLICT);
  //   }

  //   // Encrypt the password
  //   const encryptedPassword = await hashPassword(password);

  //   if (id) {  
  //     console.log("payloadUpdate",payload);
  //     return this.updateUser(id, { ...payload, password: encryptedPassword });
  //   } else {
  //     console.log("payloadCreate",payload);
      
  //     // Create a new user
  //     return this.prisma.user.create({
  //       data: {
  //         userName,
  //         email,
  //         password: encryptedPassword,
  //         phoneNumber,
  //         fullName
  //       }
  //     });
  //   }
  // }

  // private async updateUser(id: string, payload: RegisterUserDto): Promise<any> {
  //   const { userName, email, password, phoneNumber } = payload;
  // console.log("payload",payload);
  
  //   // Find the user to be updated
  //   const existingUser = await this.prisma.user.findUnique({ where: { id } });
  
  //   if (!existingUser) {
  //     throw new HttpException("User not found.", HttpStatus.NOT_FOUND);
  //   }
  
  //   // Check for conflicts with other users
  //   const conflictingUser = await this.prisma.user.findFirst({
  //     where: {
  //       AND: [
  //         { id: { not: id } }, // Exclude the current user
  //         {
  //           OR: [
  //             userName ? { userName } : undefined,
  //             email ? { email } : undefined,
  //             phoneNumber ? { phoneNumber } : undefined
  //           ]
  //         }
  //       ]
  //     }
  //   });
  
  //   if (conflictingUser) {
  //     const conflictField =
  //       conflictingUser.userName === userName
  //         ? "User name"
  //         : conflictingUser.email === email
  //         ? "Email address"
  //         : "Phone number";
  
  //     throw new HttpException(`${conflictField} already exists.`, HttpStatus.CONFLICT);
  //   }
  
  //   // Encrypt the password if provided
  //   let encryptedPassword = undefined;
  //   if (password) {
  //     encryptedPassword = await hashPassword(password);
  //   }
  
  //   // Prepare the updated data
  //   const updatedData: any = {
  //     ...(userName && { userName }),
  //     ...(email && { email }),
  //     ...(encryptedPassword && { password: encryptedPassword }),
  //     ...(phoneNumber && { phoneNumber })
  //   };
  
  //   // Only update fields that are provided (excluding undefined ones)
  //   return this.prisma.user.update({
  //     where: { id },
  //     data: updatedData
  //   });
  // }
  
  async createUser(payload: RegisterUserDto): Promise<any> {
    const { id, userName, email, password, phoneNumber, fullName } = payload;

  
    // Handle Create or Update
    if (id) {
      console.log("payloadUpdate",payload);
      
      // Update existing user
      return this.updateUser(id, payload);
    }
  
    // Validation for user creation
    // if (!userName || !email || !password || !phoneNumber || !fullName) {
    //   throw new HttpException(
    //     "All fields (userName, email, password, phoneNumber, fullName) are required.",
    //     HttpStatus.BAD_REQUEST
    //   );
    // }
  
    // Check for existing conflicts during creation
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
  
    // Create the new user
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
  
  private async updateUser(id: string, payload: RegisterUserDto): Promise<any> {
    const { userName, email, password, phoneNumber,role } = payload;
    console.log("payload", payload);
  
    // Find the user to be updated
    const existingUser = await this.prisma.user.findUnique({ where: { id } });
  
    if (!existingUser) {
      throw new HttpException("User not found.", HttpStatus.NOT_FOUND);
    }
  
    // Build the OR condition dynamically
    const orConditions = [
      userName ? { userName } : null,
      email ? { email } : null,
      phoneNumber ? { phoneNumber } : null,
    ].filter(Boolean); // Filter out null or undefined values
  
    // Check for conflicts with other users
    if (orConditions.length > 0) {
      const conflictingUser = await this.prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: id } }, // Exclude the current user
            { OR: orConditions },
          ],
        },
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
    }
  
    // Encrypt the password if provided
    const encryptedPassword = password ? await hashPassword(password) : undefined;
  
    // Prepare the updated data
    const updatedData: any = {
      ...(userName && { userName }),
      ...(email && { email }),
      ...(encryptedPassword && { password: encryptedPassword }),
      ...(phoneNumber && { phoneNumber }),
      ...(role && { role })
    };
  
    // Update the user with the provided data
    return this.prisma.user.update({
      where: { id },
      data: updatedData,
    });
  }
  
  
  

  async loginUser(loginInput: LoginDto, @Res() res: Response): Promise<any> {
    const { identifier, password, otp } = loginInput;
  
    // Find user by email, username, or phone
    const findUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { userName: identifier }, { phoneNumber: identifier }]
      }
    });
  
    if (!findUser) {
      throw new HttpException("User not found.", HttpStatus.NOT_FOUND);
    }
  
    // If OTP is provided, check it
    if (otp ) {
      console.log("otp",otp);
      if (!findUser.otp || findUser.otp !== otp) {
        throw new HttpException("Invalid OTP.", HttpStatus.UNAUTHORIZED);
      }
    } else if (password && password.trim() !== "") { 
     console.log("password",password);
     
      const isPasswordValid = await comparePassword(password, findUser.password);
      if (!isPasswordValid) {
        throw new HttpException("Invalid password.", HttpStatus.UNAUTHORIZED);
      }
    }
  
    // Generate access and refresh tokens
    const { accessToken, refreshToken } = await this.generateTokens(findUser.id,findUser.role);
    await this.prisma.user.update({
      where: { id: findUser.id },
      data: { refreshToken, accessToken, otp: null }
    });
  
    // Set the refresh token in the response cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
  
    return { accessToken, refreshToken };
  }
  
  
  
  async otpGenrate(loginInput: LoginDto): Promise<any> {
    const { identifier } = loginInput;
  
    // Find user by email, username, or phone
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { userName: identifier }, { phoneNumber: identifier }]
      }
    });
  
    if (!user) {
      throw new HttpException("User not found.", HttpStatus.NOT_FOUND);
    }
  
    // Generate otp
    const otpGenerate = "4444"; // OTP should be a string
    await this.prisma.user.update({
      where: { id: user.id },
      data: { otp: otpGenerate }
    });
  }
  
 

  async refreshTokens(refreshToken: string, accessToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Verify the refresh token
      const refreshPayload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
  // console.log(refreshPayload,"refreshPayload-164-service");
  
      const userId = refreshPayload.userId;
  
      // Validate the refresh token against the database (using the User model)
      const storedUser = await this.prisma.User.findUnique({
        where: { id: userId },
      });

  
      if (!storedUser || storedUser.refreshToken !== refreshToken) {
        throw new HttpException('Invalid or expired refresh token', HttpStatus.UNAUTHORIZED);
      }
  
      // Decode the access token without verifying (to check its expiry)
      const decodedAccessToken = this.jwtService.decode(accessToken) as any;
  
      if (!decodedAccessToken) {
        throw new HttpException('Invalid access token', HttpStatus.UNAUTHORIZED);
      }
  
      const expiryTime = decodedAccessToken.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
  console.log(expiryTime > currentTime, "expiryTime > currentTime");
  
      // If the access token is still valid, return it along with the same refreshToken
      if (expiryTime > currentTime) {
        return { accessToken, refreshToken: storedUser.refreshToken }; // Return the same refresh token
      }
  console.log(userId, "userId-200");
  
      // Generate new access and refresh tokens if access token is expired
      const tokens = await this.generateTokens(userId,storedUser.role);
  console.log(tokens, "tokens-206");
  
      // Update the refresh token in the database
      await this.prisma.User.update({
        where: { id: userId },
        data: {
          refreshToken: tokens.refreshToken,
          accessToken: tokens.accessToken,
        },
      });
  
      return tokens; // Return new tokens
    } catch (error) {
      throw new HttpException(error.message || 'Failed to refresh tokens', HttpStatus.UNAUTHORIZED);
    }
  }
  
  
  private async generateTokens(userId: string,role?:string) {
    const payload = { userId,role };

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: "1d"
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: "7d"
    });

    return { accessToken, refreshToken };
  }
  // async validationToken(refreshToken: string) {
  //   try {
  //     const payload = await this.jwtService.verify(refreshToken, {
  //       secret: process.env.JWT_REFRESH_SECRET
  //     });
  //     const userRefresjToken = await this.prisma.user.findUnique({
  //       where: {
  //         id: payload.userId
  //       }
  //     });
  //     // if (userRefresjToken.refreshToken !== refreshToken) {
  //     //   throw new HttpException("Invalid token.", HttpStatus.UNAUTHORIZED);
  //     // }
  //     // const tokens = await this.generateTokens(payload.userId);

  //     // return { ...tokens };
  //   } catch (error) {
  //     console.log(error);
  //     throw new HttpException("Invalid token." + error, HttpStatus.UNAUTHORIZED);
  //   }
  // }

  async resetPassword(resetPasswordInput: ResetPasswordDto): Promise<any> {
    const { identifier, password } = resetPasswordInput;

    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { userName: identifier }, { phoneNumber: identifier }]
      }
    });
    if (!user) {
      throw new HttpException("User not found.", HttpStatus.NOT_FOUND);
    }
    const isPasswordMatch = await comparePassword(password, user.password);
    if (isPasswordMatch) {
      throw new HttpException("New password cannot be the same as the old password.", HttpStatus.BAD_REQUEST);
    }
    const encryptedPassword = await hashPassword(password);

    return this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: encryptedPassword
      }
    });
  }
}
