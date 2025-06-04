

import knex from '../config/db';
import { v4 as uuidv4 } from 'uuid';
import { Wallet } from '../models/wallet';

export const fundWallet = async (userId: string, amount: number): Promise<Wallet> => {
  return knex.transaction(async (trx) => {
    const wallet = await trx('wallets').where({ userId }).first();
    if (!wallet) throw new Error('Wallet not found');
    
    const newBalance = wallet.balance + amount;
    await trx('wallets').where({ userId }).update({ balance: newBalance, updatedAt: new Date() });
    await trx('transactions').insert({
      id: uuidv4(),
      userId,
      type: 'FUND',
      amount,
      status: 'SUCCESS',
      createdAt: new Date()
    });
    return { ...wallet, balance: newBalance };
  });
};

export const transferFunds = async (userId: string, recipientId: string, amount: number): Promise<Wallet> => {
  return knex.transaction(async (trx) => {
    const senderWallet = await trx('wallets').where({ userId }).first();
    const recipientWallet = await trx('wallets').where({ userId: recipientId }).first();
    if (!senderWallet || !recipientWallet) throw new Error('Wallet not found');
    if (senderWallet.balance < amount) throw new Error('Insufficient funds');

    await trx('wallets').where({ userId }).update({ balance: senderWallet.balance - amount, updatedAt: new Date() });
    await trx('wallets').where({ userId: recipientId }).update({ balance: recipientWallet.balance + amount, updatedAt: new Date() });
    await trx('transactions').insert({
      id: uuidv4(),
      userId,
      type: 'TRANSFER',
      amount,
      recipientId,
      status: 'SUCCESS',
      createdAt: new Date()
    });
    return { ...senderWallet, balance: senderWallet.balance - amount };
  });
};

export const withdrawFunds = async (userId: string, amount: number): Promise<Wallet> => {
  return knex.transaction(async (trx) => {
    const wallet = await trx('wallets').where({ userId }).first();
    if (!wallet) throw new Error('Wallet not found');
    if (wallet.balance < amount) throw new Error('Insufficient funds');

    const newBalance = wallet.balance - amount;
    await trx('wallets').where({ userId }).update({ balance: newBalance, updatedAt: new Date() });
    await trx('transactions').insert({
      id: uuidv4(),
      userId,
      type: 'WITHDRAW',
      amount,
      status: 'SUCCESS',
      createdAt: new Date()
    });
    return { ...wallet, balance: newBalance };
  });
};