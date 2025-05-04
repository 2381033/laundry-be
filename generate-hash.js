// generate-hash.js
require("dotenv").config(); // Muat variabel dari .env
const bcrypt = require("bcrypt");

const passwordToHash = process.env.PASSWORD_TO_HASH;

if (!passwordToHash) {
  console.error("❌ Error: Harap atur variabel PASSWORD_TO_HASH di file .env");
  process.exit(1); // Keluar jika password tidak diset
}

const saltRounds = 10; // Jumlah salt rounds (10-12 adalah standar yang baik)

async function createHash() {
  try {
    console.log(
      `⏳ Membuat hash untuk password... (mungkin perlu beberapa saat)`
    );

    const hashedPassword = await bcrypt.hash(passwordToHash, saltRounds);

    console.log("\n✅ Hash berhasil dibuat!\n");
    console.log(
      "===================================================================="
    );
    console.log("SALIN STRING HASH BERIKUT:");
    console.log(
      "====================================================================\n"
    );
    console.log(hashedPassword); // Ini adalah hash yang perlu Anda salin
    console.log(
      "\n====================================================================\n"
    );
    console.log(
      'Tempelkan (paste) hash ini ke kolom "password" untuk pengguna admin Anda di SQL Editor NeonDB.'
    );
    console.log("Pastikan menggunakan tanda kutip tunggal di SQL, contoh:");
    console.log(
      "INSERT INTO users (..., password, ...) VALUES (..., '" +
        hashedPassword +
        "', ...);"
    );
    console.log(
      "UPDATE users SET password = '" +
        hashedPassword +
        "' WHERE email = 'admin@example.com';"
    );
    console.log(
      "====================================================================\n"
    );
  } catch (error) {
    console.error("❌ Gagal membuat hash:", error);
    process.exit(1);
  }
}

// Jalankan fungsi
createHash();
