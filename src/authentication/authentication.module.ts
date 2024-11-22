import { Module } from "@nestjs/common";
import { AuthenticationService } from "./authentication.service";
import { AuthenticationController } from "./authentication.controller";
import { PrismaService } from "src/prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";

@Module({
  controllers: [AuthenticationController],
  providers: [AuthenticationService, PrismaService, JwtService]
})
export class AuthenticationModule {}
