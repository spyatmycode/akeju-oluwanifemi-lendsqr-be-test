"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
function up(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        yield knex.schema.createTable('users', (table) => {
            table.uuid('id').primary();
            table.string('name').notNullable();
            table.string('email').notNullable().unique();
            table.enum('karmaStatus', ['clean', 'blacklisted']).notNullable();
            table.timestamp('createdAt').defaultTo(knex.fn.now());
            table.timestamp('updatedAt').defaultTo(knex.fn.now());
        });
        yield knex.schema.createTable('wallets', (table) => {
            table.uuid('id').primary();
            table.uuid('userId').notNullable().references('id').inTable('users');
            table.decimal('balance', 10, 2).notNullable().defaultTo(0);
            table.timestamp('updatedAt').defaultTo(knex.fn.now());
        });
        yield knex.schema.createTable('transactions', (table) => {
            table.uuid('id').primary();
            table.uuid('userId').notNullable().references('id').inTable('users');
            table.enum('type', ['FUND', 'TRANSFER', 'WITHDRAW']).notNullable();
            table.decimal('amount', 10, 2).notNullable();
            table.uuid('recipientId').references('id').inTable('users');
            table.enum('status', ['PENDING', 'SUCCESS', 'FAILED']).notNullable();
            table.timestamp('createdAt').defaultTo(knex.fn.now());
        });
    });
}
function down(knex) {
    return __awaiter(this, void 0, void 0, function* () {
        yield knex.schema.dropTableIfExists('transactions');
        yield knex.schema.dropTableIfExists('wallets');
        yield knex.schema.dropTableIfExists('users');
    });
}
