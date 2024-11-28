import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";
import { join } from "path";
import { NestExpressApplication } from "@nestjs/platform-express";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

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

  app.useStaticAssets(join(__dirname, "..", "uploads"), {
    prefix: "/uploads/"
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
