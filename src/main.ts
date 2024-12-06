import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import * as path from "path";
import * as express from "express";
import * as cookieParser from 'cookie-parser';
import { NestExpressApplication } from "@nestjs/platform-express";
import { existsSync, mkdirSync } from "fs";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser())
  //Swagger setup
  const config = new DocumentBuilder()
    .setTitle("NestJS Prisma Postgres")
    .setDescription("The NestJS Prisma Postgres API description")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  app.useGlobalPipes(new ValidationPipe());
  SwaggerModule.setup("api", app, document);
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }
  // app.useStaticAssets(join(__dirname, "..", "uploads"), {
  //   prefix: "/uploads/"
  // });
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
