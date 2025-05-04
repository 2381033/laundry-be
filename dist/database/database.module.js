"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const path = require("path");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const isProduction = configService.get("NODE_ENV") === "production";
                    const host = configService.get("POSTGRES_HOST");
                    console.log("--- TypeORM Config ---");
                    console.log("Host:", host);
                    console.log("Port:", configService.get("POSTGRES_PORT"));
                    console.log("User:", configService.get("POSTGRES_USER"));
                    console.log("DB:", configService.get("POSTGRES_DATABASE"));
                    console.log("SSL Enabled:", host !== "localhost" && host !== "127.0.0.1");
                    console.log("----------------------");
                    return {
                        type: "postgres",
                        host: host,
                        port: configService.get("POSTGRES_PORT"),
                        username: configService.get("POSTGRES_USER"),
                        password: configService.get("POSTGRES_PASSWORD"),
                        database: configService.get("POSTGRES_DATABASE"),
                        entities: [path.join(__dirname, "/../**/*.entity{.ts,.js}")],
                        synchronize: false,
                        logging: !isProduction,
                        ssl: host !== "localhost" && host !== "127.0.0.1"
                            ? { rejectUnauthorized: false }
                            : false,
                    };
                },
            }),
        ],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map