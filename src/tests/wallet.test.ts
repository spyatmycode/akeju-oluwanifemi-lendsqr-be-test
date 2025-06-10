import request from 'supertest';
import app from '../index';
import knex from '../config/db';
import * as path from 'path';
import mockAxios from 'jest-mock-axios';

beforeAll(async () => {
  mockAxios.get.mockResolvedValue({ data: { blacklisted: false } }); // Here we are mocking the Adjutor API
  await knex.migrate.latest({
    directory: path.resolve(__dirname, '../migrations')
  });
}, 10000);

beforeEach(async () => {
  // We first clean up tables in the correct order (child tables first) to avoid foreign key errors.
  await knex('transactions').del();
  await knex('wallets').del();
  await knex('users').del();

  let userResponse;
  try {
    userResponse = await request(app)
      .post('/users')
      .send({ name: 'John Doe', email: `john${Date.now()}@example.com` }); // Unique email for every test
    expect(userResponse.status).toBe(201);
    expect(userResponse.body).toHaveProperty('id');
  } catch (error) {
    console.error('User creation failed:', error);
    throw error; // Fail test if user creation fails
  }
  userId = userResponse.body.id;

  let recipientResponse;
  try {
    recipientResponse = await request(app)
      .post('/users')
      .send({ name: 'Jane Doe', email: `jane${Date.now()}@example.com` }); // Unique email
    expect(recipientResponse.status).toBe(201);
    expect(recipientResponse.body).toHaveProperty('id');
  } catch (error) {
    console.error('Recipient creation failed:', error);
    throw error;
  }
  recipientId = recipientResponse.body.id;
}, 10000);

afterAll(async () => {
  // Here we're cleaning up in the correct order before rollback
  await knex('transactions').del();
  await knex('wallets').del();
  await knex('users').del();
  
  await knex.migrate.rollback({
    directory: path.resolve(__dirname, '../migrations')
  });
  await knex.destroy();
  mockAxios.reset();
}, 10000);

let userId: string;
let recipientId: string;

describe('Wallet API', () => {
  test('POST /wallets/fund - should fund wallet', async () => {
    const response = await request(app)
      .post('/wallets/fund')
      .set('Authorization', 'Bearer faux-token-123')
      .send({ userId, amount: 1000 });
    expect(response.status).toBe(200);
    expect(response.body.balance).toBe(1000);
  }, 10000);

  test('POST /wallets/fund - should fail without token', async () => {
    const response = await request(app)
      .post('/wallets/fund')
      .send({ userId, amount: 1000 });
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid or missing token');
  }, 10000);

  test('POST /wallets/transfer - should transfer funds', async () => {
    await request(app)
      .post('/wallets/fund')
      .set('Authorization', 'Bearer faux-token-123')
      .send({ userId, amount: 1000 });

    const response = await request(app)
      .post('/wallets/transfer')
      .set('Authorization', 'Bearer faux-token-123')
      .send({ userId, recipientId, amount: 500 });
    expect(response.status).toBe(200);
    expect(response.body.balance).toBe(500);
  }, 10000);

  test('POST /wallets/transfer - should fail on insufficient funds', async () => {
    const response = await request(app)
      .post('/wallets/transfer')
      .set('Authorization', 'Bearer faux-token-123')
      .send({ userId, recipientId, amount: 500 });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Insufficient funds');
  }, 10000);

  test('POST /wallets/withdraw - should withdraw funds', async () => {
    await request(app)
      .post('/wallets/fund')
      .set('Authorization', 'Bearer faux-token-123')
      .send({ userId, amount: 1000 });

    const response = await request(app)
      .post('/wallets/withdraw')
      .set('Authorization', 'Bearer faux-token-123')
      .send({ userId, amount: 300 });
    expect(response.status).toBe(200);
    expect(response.body.balance).toBe(700);
  }, 10000);
});