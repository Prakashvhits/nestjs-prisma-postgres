import { Body, Controller, Post } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserDto } from "./dto/user.dto";

@Controller("user1")
export class UserController {
  constructor(private userService: UserService) {}

  @Post("create1")
  async createUser(@Body() userDto: UserDto) {
    // Ensure all fields are provided for creating a new user
    console.log("userDto", userDto);
    const { userName, email, password, phoneNumber } = userDto;
    if (!userName || !email || !password || !phoneNumber) {
      throw new Error("All fields are required for user creation.");
    }
    return this.userService.createUser(userDto);
  }
}
