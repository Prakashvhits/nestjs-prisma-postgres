import { Controller, Post, Body, HttpStatus, HttpCode, Req, HttpException, Res, UseGuards } from "@nestjs/common";
import { AuthenticationService } from "./authentication.service";
import { LoginDto,  RegisterUserDto, ResetPasswordDto } from "./dto/create-authentication.dto";
import {  ApiBody, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { extractTokenFromHeader } from "src/utils/common.services";
import { Request, Response } from "express";
import { RefreshTokenGuard } from "src/guards/refreshToken_guards";

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

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
@UseGuards(RefreshTokenGuard)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Access token refreshed successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired refresh token',
  })
  async refreshTokens(@Req() req: Request, @Res() res: Response) {
    try {
      // Extract refreshToken from cookies
      const refreshToken = req.cookies.refreshToken;
  // console.log(refreshToken,"refreshToken-59");
  
      if (!refreshToken) {
        throw new HttpException('No refresh token found in cookies', HttpStatus.UNAUTHORIZED);
      }
  
      // Extract accessToken from the Authorization header
      const accessToken = await extractTokenFromHeader(req);
  
      // Delegate token refresh logic to the service
      const refreshedTokens = await this.authenticationService.refreshTokens(refreshToken, accessToken);


      // Check if a new refreshToken is provided
      if (refreshedTokens.refreshToken) {
        // Set the new refreshToken in the cookies
        res.cookie('refreshToken', refreshedTokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
      }
  
      return res.json(refreshedTokens); // Send new tokens as JSON response
    } catch (error) {
      console.error('Error refreshing tokens:', error.message);
      throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
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
