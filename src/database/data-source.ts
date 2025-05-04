// src/database/data-source.ts
// ========================================================================
// KONFIGURASI INI DIRANCANG UNTUK TYPEORM CLI MENGGUNAKAN ts-node
// ========================================================================
// - Digunakan oleh skrip `npm run typeorm:*` yang memakai `ts-node`.
// - TIDAK memerlukan `npm run build` sebelumnya untuk generate/revert/show.
// - Membaca file .ts langsung dari folder /src.
// - Mengekspor INSTANCE DataSource (sesuai permintaan error).
// ========================================================================

import "dotenv/config"; // Memuat variabel dari file .env ke process.env
import { DataSource, DataSourceOptions } from "typeorm"; // Import DataSource juga
import * as path from "path";

// Log untuk memastikan .env terbaca oleh CLI (opsional, hapus jika tidak perlu)
console.log(
  `[data-source.ts] Reading Env Variables - Host: ${process.env.POSTGRES_HOST}`
);

const host = process.env.POSTGRES_HOST;
const port = parseInt(process.env.POSTGRES_PORT || "5432", 10);
const username = process.env.POSTGRES_USER;
const password = process.env.POSTGRES_PASSWORD;
const database = process.env.POSTGRES_DATABASE;

// Validasi Variabel Lingkungan (Penting untuk Debugging CLI)
if (!host || !port || !username || !database) {
  // Tambahkan cek variabel lain jika perlu
  console.error(
    "[data-source.ts] FATAL ERROR: Variabel lingkungan database (POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_DATABASE) tidak diatur dengan benar! Periksa file .env Anda."
  );
  throw new Error(
    "Missing required database environment variables for TypeORM CLI."
  );
}

// Opsi Konfigurasi DataSource
// Perhatikan path menunjuk ke file .ts di folder src
export const dataSourceOptions: DataSourceOptions = {
  type: "postgres",
  host: host,
  port: port,
  username: username,
  password: password,
  database: database,

  // --- Path ke file .ts di folder /src ---
  // Asumsi: File ini (data-source.ts) ada di 'src/database/'
  // __dirname akan menunjuk ke '.../src/database' saat dijalankan dengan ts-node

  // Mencari semua file *.entity.ts di dalam folder 'src' dan subfoldernya.
  entities: [path.join(__dirname, "..", "**/*.entity.ts")], // <-- Path ke .ts

  // Mencari file migrasi *.ts di dalam folder 'src/database/migrations/'.
  // (Sesuaikan './migrations/' jika folder migrasi Anda BUKAN 'src/database/migrations')
  migrations: [path.join(__dirname, "./migrations/*.ts")], // <-- Path ke .ts
  // ------------------------------------------------------

  synchronize: false, // SANGAT PENTING: Harus false saat menggunakan migrasi.
  logging: true, // Berguna untuk melihat query SQL yang dijalankan oleh CLI.
  ssl:
    host && host !== "localhost" && host !== "127.0.0.1" // Aktifkan SSL jika BUKAN koneksi lokal
      ? { rejectUnauthorized: false } // Umumnya diperlukan untuk NeonDB/Vercel
      : false,
};

// *** PERUBAHAN UTAMA: BUAT INSTANCE DAN EKSPOR INSTANCE ***
const dataSource = new DataSource(dataSourceOptions);

// Ekspor instance DataSource. CLI (dengan ts-node) mengharapkan ini berdasarkan error.
export default dataSource;
