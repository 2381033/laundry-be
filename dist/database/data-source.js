"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSourceOptions = void 0;
require("dotenv/config");
const typeorm_1 = require("typeorm");
const path = require("path");
console.log(`[data-source.ts] Reading Env Variables - Host: ${process.env.POSTGRES_HOST}`);
const host = process.env.POSTGRES_HOST;
const port = parseInt(process.env.POSTGRES_PORT || "5432", 10);
const username = process.env.POSTGRES_USER;
const password = process.env.POSTGRES_PASSWORD;
const database = process.env.POSTGRES_DATABASE;
if (!host || !port || !username || !database) {
    console.error("[data-source.ts] FATAL ERROR: Variabel lingkungan database (POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_DATABASE) tidak diatur dengan benar! Periksa file .env Anda.");
    throw new Error("Missing required database environment variables for TypeORM CLI.");
}
exports.dataSourceOptions = {
    type: "postgres",
    host: host,
    port: port,
    username: username,
    password: password,
    database: database,
    entities: [path.join(__dirname, "..", "**/*.entity.ts")],
    migrations: [path.join(__dirname, "./migrations/*.ts")],
    synchronize: false,
    logging: true,
    ssl: host && host !== "localhost" && host !== "127.0.0.1"
        ? { rejectUnauthorized: false }
        : false,
};
const dataSource = new typeorm_1.DataSource(exports.dataSourceOptions);
exports.default = dataSource;
//# sourceMappingURL=data-source.js.map