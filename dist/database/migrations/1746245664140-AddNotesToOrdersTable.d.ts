import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddNotesToOrdersTable1746245664140 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
