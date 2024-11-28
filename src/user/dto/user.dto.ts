import { IsOptional, IsString, IsNumber, IsObject } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UserDto {
  @ApiProperty({ description: "Filters to apply on the user data", required: false, type: Object })
  @IsOptional()
  @IsObject()
  filters?: object;

  @ApiProperty({ description: "Current page number for pagination", required: false, example: 1 })
  @IsOptional()
  @IsNumber()
  page?: number;

  @ApiProperty({ description: "Number of records per page", required: false, example: 10 })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiProperty({ description: "Search query string", required: false, example: "John" })
  @IsOptional()
  @IsString()
  search?: string;
}
export class UserDetailsDto {
  @ApiProperty({ description: "Unique identifier of the user", required: false, type: String })
  @IsOptional()
  id?: string;
}
export class UploadUserProfileImageDto {
  @ApiProperty({ description: "Unique identifier of the user", required: false, type: String })
  @IsOptional()
  id: string;
}
export class uploadDoucumentDto {
  [x: string]: any;
  @ApiProperty({ description: "Unique identifier of the user", required: false, type: String })
  @IsOptional()
  id: string;
}
