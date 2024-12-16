import {
  IsNotEmpty,
  IsEmail,
  IsString,
  Matches,
  MinLength,
  MaxLength,
  IsPhoneNumber,
  IsOptional
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RegisterUserDto {
  @ApiPropertyOptional({
    description: "Unique identifier of the user",
    type: String
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional({
    description: "Full name of the user",
    type: String
  })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({
    description: "Profile image URL of the user",
    type: String
  })
  @IsOptional()
  @IsString()
  profileImage?: string;

  @ApiProperty({
    description: "Username must be at least six characters long and contain only letters and numbers",
    type: String,
    example: "user123"
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9]{6,}$/, {
    message: "Username must be at least six characters long and contain only letters and numbers"
  })
  userName?: string;

  @ApiProperty({
    description: "User's email address",
    type: String,
    example: "example@example.com"
  })
  @IsOptional()
  @IsNotEmpty({ message: "Email is required" })
  @IsEmail({}, { message: "Invalid email format" })
  email?: string;

  @ApiProperty({
    description:
      "Password must be 8-16 characters long, contain at least one uppercase letter, one numeric character, and one special character",
    type: String,
    example: "P@ssw0rd1"
  })
  @IsOptional()
  @MinLength(8, { message: "Password must be at least 8 characters" })
  @MaxLength(16, { message: "Password must not exceed 16 characters" })
  @Matches(/[A-Z]/, {
    message: "Password must contain at least one uppercase letter"
  })
  @Matches(/\d/, {
    message: "Password must contain at least one numeric character"
  })
  @Matches(/[\W_]/, {
    message: "Password must contain at least one special character"
  })
  password?: string;

  @ApiProperty({
    description: "Phone number must include country code",
    type: String,
    example: "+1234567890"
  })
  @IsOptional()
  @IsString()
  @IsPhoneNumber(null, {
    message: "Phone number must include country code"
  })
  @Matches(/^\+?\d{5,16}$/, {
    message: "Phone number must be 5-16 digits including country code"
  })
  phoneNumber?: string;
  @IsOptional()
  @IsString()
  role?: string;
}
export class LoginDto {
  @ApiProperty({ description: "Email, username, or phone number" })
  identifier: string;
  @IsOptional()
  @ApiProperty({ description: "User password" })
  password?: string;
  @IsOptional()
  @ApiProperty({ description: "User OTP" })
  otp?: string;
}
export class RefreshTokenDto {
  @IsOptional()
  @ApiProperty({ description: "Refresh token" })
  refreshToken: string;
  @IsOptional()
  @ApiProperty({ description: "Access token" })
  accessToken: string;
}
// export class otpDto {
//   @ApiProperty({ description: "Email, username, or phone number" })
//   identifier: string;
// }

export class ResetPasswordDto {
  @ApiProperty({ description: "Email, username, or phone number" })
  identifier: string;

  @ApiProperty({ description: "New password" })
  password: string;
}
