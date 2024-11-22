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

export class UserDto {
  @IsOptional()
  @IsString()
  id?: string;
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  profileImage?: string;

  @IsString()
  @Matches(/^[a-zA-Z0-9]{6,}$/, {
    message: "Username must be at least six characters long and contain only letters and numbers"
  })
  userName?: string;

  @IsNotEmpty({ message: "Email is required" })
  @IsEmail({}, { message: "Invalid email format" })
  email?: string;

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

  @IsString()
  @IsPhoneNumber(null, {
    message: "Phone number must include country code"
  })
  @Matches(/^\+?\d{5,16}$/, {
    message: "Phone number must be 5-16 digits including country code"
  })
  phoneNumber?: string;
}
