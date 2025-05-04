"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const dotenv = require("dotenv");
dotenv.config();
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const logger = new common_1.Logger("Bootstrap");
    app.enableCors({
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
        credentials: true,
    });
    app.setGlobalPrefix("api");
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle("Laundry Service API")
        .setDescription("API documentation for the Online Laundry Service")
        .setVersion("1.0")
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup("docs", app, document);
    const port = configService.get("PORT") || 3000;
    await app.listen(port);
    const serverUrl = await app.getUrl();
    const swaggerUrl = `${serverUrl}/docs`;
    logger.log(`🚀 Application is running on: ${serverUrl}`);
    logger.log(`📚 Swagger Docs available at: ${swaggerUrl}`);
    logger.log(`💾 Using Database Host: ${configService.get("POSTGRES_HOST")}`);
}
bootstrap().catch((err) => {
    const logger = new common_1.Logger("Bootstrap");
    logger.error("❌ Error during application bootstrap:", err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map