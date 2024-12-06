import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UserModule } from "./user/user.module";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthenticationModule } from "./authentication/authentication.module";
import * as cookieParser from 'cookie-parser';

@Module({
  imports: [PrismaModule, UserModule, AuthenticationModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser()).forRoutes('*'); // Apply cookie parser middleware
  }
}
// export class AppModule {}
