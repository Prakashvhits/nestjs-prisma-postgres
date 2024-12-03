import { Controller, Post, Body, HttpStatus, HttpCode } from "@nestjs/common";
import { AuthenticationService } from "./authentication.service";
import { LoginDto, RefreshTokenDto, RegisterUserDto, ResetPasswordDto } from "./dto/create-authentication.dto";
import { ApiBody, ApiOperation, ApiResponse } from "@nestjs/swagger";

@Controller("authentication")
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post("createAndUpdate")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new user" })
  @ApiResponse({ status: 201, description: "User created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  create(@Body() createAuthenticationDto: RegisterUserDto) {
    return this.authenticationService.createUser(createAuthenticationDto);
  }
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login a user" })
  @ApiBody({
    description: "User login credentials",
    type: LoginDto // Define a DTO (Data Transfer Object) to specify the structure
  })
  @ApiResponse({ status: HttpStatus.OK, description: "User logged in successfully" })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Username or password is incorrect" })
  loginUser(@Body() loginInput: LoginDto) {
    return this.authenticationService.loginUser(loginInput);
  }
  @Post("refresh-token")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refresh access token" })
  @ApiBody({
    description: "Refresh token",
    type: RefreshTokenDto
  })
  @ApiResponse({ status: HttpStatus.OK, description: "Access token refreshed successfully" })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Invalid refresh token" })
  refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authenticationService.refreshTokens(refreshTokenDto.refreshToken);
  }

  @Post("rest-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Reset password" })
  @ApiBody({
    description: "Reset password request",
    type: ResetPasswordDto
  })
  @ApiResponse({ status: HttpStatus.OK, description: "Password reset successfully" })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: "Invalid reset password request" })
  resetPassword(@Body() resetPasswordInput: ResetPasswordDto) {
    return this.authenticationService.resetPassword(resetPasswordInput);
  }
}
