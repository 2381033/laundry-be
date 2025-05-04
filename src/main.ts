// src/main.ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe, Logger } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";
import * as dotenv from "dotenv";

// Muat variabel .env sesegera mungkin
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger("Bootstrap"); // Logger untuk konteks Bootstrap

  // --- Konfigurasi Global ---

  // CORS (Cross-Origin Resource Sharing)
  app.enableCors({
    origin: "*", // PERINGATAN: Ganti '*' dengan URL frontend spesifik Anda di production!
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });

  // Global Prefix untuk semua rute API
  app.setGlobalPrefix("api");

  // Global Validation Pipe untuk validasi DTO otomatis
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Abaikan properti yang tidak didefinisikan di DTO
      transform: true, // Otomatis transformasi payload ke instance DTO
      forbidNonWhitelisted: true, // Tolak request jika ada properti tak dikenal
      transformOptions: {
        enableImplicitConversion: true, // Membantu konversi tipe data (misal string ke number di query/param)
      },
    })
  );

  // --- Konfigurasi Swagger (OpenAPI Documentation) ---
  const swaggerConfig = new DocumentBuilder()
    .setTitle("Laundry Service API")
    .setDescription("API documentation for the Online Laundry Service")
    .setVersion("1.0")
    .addBearerAuth() // Penting untuk menampilkan input token JWT di Swagger UI
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // Path untuk Swagger UI. Karena ada global prefix 'api', path 'docs' akan menjadi '/api/docs'
  SwaggerModule.setup("docs", app, document); // <-- PERUBAHAN DI SINI: dari 'api/docs' menjadi 'docs'

  // --- Start Aplikasi ---

  // Dapatkan port dari environment variable atau gunakan default 3000
  const port = configService.get<number>("PORT") || 3000;

  // Mulai mendengarkan koneksi masuk
  await app.listen(port);

  // --- Logging Informasi Startup ---
  const serverUrl = await app.getUrl();
  const swaggerUrl = `${serverUrl}/docs`; // <-- PERUBAHAN DI SINI: Sesuaikan dengan path setup Swagger

  logger.log(`🚀 Application is running on: ${serverUrl}`);
  logger.log(`📚 Swagger Docs available at: ${swaggerUrl}`); // <-- Log URL Swagger yang benar
  logger.log(
    `💾 Using Database Host: ${configService.get<string>("POSTGRES_HOST")}`
  );
}

// Jalankan fungsi bootstrap
bootstrap().catch((err) => {
  // Tangkap error saat startup jika terjadi
  const logger = new Logger("Bootstrap");
  logger.error("❌ Error during application bootstrap:", err);
  process.exit(1); // Keluar dari proses jika bootstrap gagal
});
