import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary();
    table.string('name').notNullable();
    table.string('email').notNullable().unique();
    table.enum('karmaStatus', ['clean', 'blacklisted']).notNullable();
    table.timestamp('createdAt').defaultTo(knex.fn.now());
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('wallets', (table) => {
    table.uuid('id').primary();
    table.uuid('userId').notNullable().references('id').inTable('users');
    table.decimal('balance', 10, 2).notNullable().defaultTo(0);
    table.timestamp('updatedAt').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('transactions', (table) => {
    table.uuid('id').primary();
    table.uuid('userId').notNullable().references('id').inTable('users');
    table.enum('type', ['FUND', 'TRANSFER', 'WITHDRAW']).notNullable();
    table.decimal('amount', 10, 2).notNullable();
    table.uuid('recipientId').references('id').inTable('users');
    table.enum('status', ['PENDING', 'SUCCESS', 'FAILED']).notNullable();
    table.timestamp('createdAt').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('transactions');
  await knex.schema.dropTableIfExists('wallets');
  await knex.schema.dropTableIfExists('users');
}