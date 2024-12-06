import { Controller, Post, Body, HttpStatus, HttpCode, Req, HttpException, Res } from "@nestjs/common";
import { AuthenticationService } from "./authentication.service";
import { LoginDto, RefreshTokenDto, RegisterUserDto, ResetPasswordDto } from "./dto/create-authentication.dto";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { decodeToken, extractTokenFromHeader } from "src/utils/common.services";
import { Request, Response } from "express";

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
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login a user' })
  @ApiBody({
    description: 'User login credentials',
    type: LoginDto,
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'User logged in successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Username or password is incorrect' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the access token and sets the refresh token as an HTTP-only cookie',
    headers: {
      'Set-Cookie': {
        description: 'Contains the refresh token in the HTTP-only cookie',
      },
    },
  })
  async loginUser(@Body() loginInput: LoginDto, @Res() res: Response): Promise<any> {
    const result = await this.authenticationService.loginUser(loginInput, res);
   return res.status(HttpStatus.OK).json(result);  
  }

  @Post("refresh-token")
@ApiBearerAuth()
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: "Refresh access token" })
@ApiBody({
  description: "Refresh token",
  type: RefreshTokenDto,
})
@ApiResponse({ status: HttpStatus.OK, description: "Access token refreshed successfully" })
@ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "Invalid refresh token" })
async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto, @Req() req: Request) {
  try {
    const accessToken = extractTokenFromHeader(req);

    if (!accessToken) {
      throw new HttpException("Access token not found in request headers", HttpStatus.UNAUTHORIZED);
    }

    // Decode the access token
    const decoded = decodeToken(accessToken);
    const expiryTime = decoded.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();

    if (expiryTime > currentTime) {
      // Access token is still valid
      return { message: "Access token is still valid", accessToken };
    }

    // Check refresh token validity
    const refreshedTokens = await this.authenticationService.refreshTokens(refreshTokenDto.refreshToken);

    if (!refreshedTokens) {
      throw new HttpException("Invalid or expired refresh token", HttpStatus.UNAUTHORIZED);
    }

    return refreshedTokens; // Return the new tokens
  } catch (error) {
    console.error("Error during token refresh:", error.message);

    if (error instanceof HttpException) {
      throw error; // Re-throw for proper HTTP response
    }

    throw new HttpException("Failed to refresh tokens", HttpStatus.INTERNAL_SERVER_ERROR);
  }
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
