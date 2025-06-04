import request from 'supertest';
import app from '../index';
import knex from '../config/db';

beforeAll(async () => {
  await knex.migrate.latest();
});

afterAll(async () => {
  await knex.migrate.rollback();
  await knex.destroy();
});

describe('Wallet API', () => {
  let userId: string;
  let recipientId: string;

  beforeEach(async () => {
    const user = await request(app)
      .post('/users')
      .send({ name: 'John Doe', email: 'john@example.com' });
    userId = user.body.id;

    const recipient = await request(app)
      .post('/users')
      .send({ name: 'Jane Doe', email: 'jane@example.com' });
    recipientId = recipient.body.id;
  });

  test('POST /wallets/fund - should fund wallet', async () => {
    const response = await request(app)
      .post('/wallets/fund')
      .set('Authorization', 'Bearer faux-token-123')
      .send({ userId, amount: 1000 });
    expect(response.status).toBe(200);
    expect(response.body.balance).toBe(1000);
  });

  test('POST /wallets/fund - should fail without token', async () => {
    const response = await request(app)
      .post('/wallets/fund')
      .send({ userId, amount: 1000 });
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Invalid or missing token');
  });

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
  });

  test('POST /wallets/transfer - should fail on insufficient funds', async () => {
    const response = await request(app)
      .post('/wallets/transfer')
      .set('Authorization', 'Bearer faux-token-123')
      .send({ userId, recipientId, amount: 500 });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Insufficient funds');
  });

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
  });
});