import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as path from "path"; // Import path jika diperlukan untuk entities

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // Pastikan ConfigModule diimpor di sini (atau secara global di AppModule)
      inject: [ConfigService], // Inject ConfigService
      useFactory: (configService: ConfigService) => {
        const isProduction =
          configService.get<string>("NODE_ENV") === "production";
        const host = configService.get<string>("POSTGRES_HOST");

        // Logging untuk memastikan nilai terbaca (hapus di production)
        console.log("--- TypeORM Config ---");
        console.log("Host:", host);
        console.log("Port:", configService.get<number>("POSTGRES_PORT"));
        console.log("User:", configService.get<string>("POSTGRES_USER"));
        console.log("DB:", configService.get<string>("POSTGRES_DATABASE"));
        console.log(
          "SSL Enabled:",
          host !== "localhost" && host !== "127.0.0.1"
        );
        console.log("----------------------");

        return {
          // --- Konfigurasi Dibuat Langsung di Sini ---
          type: "postgres",
          host: host,
          port: configService.get<number>("POSTGRES_PORT"),
          username: configService.get<string>("POSTGRES_USER"),
          password: configService.get<string>("POSTGRES_PASSWORD"),
          database: configService.get<string>("POSTGRES_DATABASE"),
          // entities: [__dirname + '/../**/*.entity{.ts,.js}'], // Cara umum
          // Atau gunakan path join jika lebih disukai dan __dirname bekerja sesuai harapan
          entities: [path.join(__dirname, "/../**/*.entity{.ts,.js}")],
          // entities: ['dist/**/*.entity.js'], // Alternatif jika __dirname bermasalah saat runtime
          synchronize: false, // PENTING: false untuk produksi, gunakan migrations
          // synchronize: !isProduction, // Atau true hanya saat development
          logging: !isProduction, // Aktifkan log query saat development
          // logging: true, // Atau selalu aktifkan jika perlu debugging
          ssl:
            host !== "localhost" && host !== "127.0.0.1"
              ? { rejectUnauthorized: false }
              : false, // Aktifkan SSL hanya jika host BUKAN localhost/127.0.0.1
          // --- Akhir Konfigurasi ---
        };
      },
    }),
  ],
})
export class DatabaseModule {}
