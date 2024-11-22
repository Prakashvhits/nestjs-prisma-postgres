import { Controller, Post, Body } from "@nestjs/common";
import { AuthenticationService } from "./authentication.service";
import { RegisterUserDto } from "./dto/create-authentication.dto";

@Controller("authentication")
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post("createAndUpdate")
  create(@Body() createAuthenticationDto: RegisterUserDto) {
    return this.authenticationService.createUser(createAuthenticationDto);
  }
  @Post("login")
  loginUser(@Body() loginInput: { identifier: string; password: string }) {
    return this.authenticationService.loginUser(loginInput);
  }

  // @Get()
  // findAll() {
  //   return this.authenticationService.findAll();
  // }

  // @Get(":id")
  // findOne(@Param("id") id: string) {
  //   return this.authenticationService.findOne(+id);
  // }

  // @Patch(":id")
  // update(@Param("id") id: string, @Body() updateAuthenticationDto: UpdateAuthenticationDto) {
  //   return this.authenticationService.update(+id, updateAuthenticationDto);
  // }

  // @Delete(":id")
  // remove(@Param("id") id: string) {
  //   return this.authenticationService.remove(+id);
  // }
}
