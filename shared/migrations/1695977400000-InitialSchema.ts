import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1695977400000 implements MigrationInterface {
    name = 'InitialSchema1695977400000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum types first
        await queryRunner.query(`
            CREATE TYPE "public"."order_status_enum" AS ENUM (
                'DRAFT', 'PLACED', 'PREPARING', 'READY', 'DELIVERED', 'COMPLETED', 'CANCELLED'
            )
        `);
        
        await queryRunner.query(`
            CREATE TYPE "public"."payment_mode_enum" AS ENUM (
                'CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'WALLET'
            )
        `);
        
        await queryRunner.query(`
            CREATE TYPE "public"."payment_status_enum" AS ENUM (
                'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED'
            )
        `);
        
        await queryRunner.query(`
            CREATE TYPE "public"."staff_status_enum" AS ENUM (
                'ACTIVE', 'ON_LEAVE', 'TERMINATED'
            )
        `);
        
        await queryRunner.query(`
            CREATE TYPE "public"."shift_timing_enum" AS ENUM (
                'MORNING', 'AFTERNOON', 'EVENING'
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TYPE "public"."shift_timing_enum"`);
        await queryRunner.query(`DROP TYPE "public"."staff_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payment_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payment_mode_enum"`);
        await queryRunner.query(`DROP TYPE "public"."order_status_enum"`);
    }
}