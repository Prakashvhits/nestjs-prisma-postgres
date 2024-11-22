import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UserModule } from "./user/user.module";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthenticationModule } from "./authentication/authentication.module";

@Module({
  imports: [PrismaModule, UserModule, AuthenticationModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
