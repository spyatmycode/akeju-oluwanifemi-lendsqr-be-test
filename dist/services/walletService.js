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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withdrawFunds = exports.transferFunds = exports.fundWallet = void 0;
const db_1 = __importDefault(require("../config/db"));
const uuid_1 = require("uuid");
const fundWallet = (userId, amount) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.default.transaction((trx) => __awaiter(void 0, void 0, void 0, function* () {
        const wallet = yield trx('wallets').where({ userId }).first();
        if (!wallet)
            throw new Error('Wallet not found');
        const newBalance = parseFloat(wallet.balance) + amount;
        yield trx('wallets').where({ userId }).update({ balance: newBalance, updatedAt: new Date() });
        yield trx('transactions').insert({
            id: (0, uuid_1.v4)(),
            userId,
            type: 'FUND',
            amount,
            status: 'SUCCESS',
            createdAt: new Date()
        });
        return Object.assign(Object.assign({}, wallet), { balance: newBalance });
    }));
});
exports.fundWallet = fundWallet;
const transferFunds = (userId, recipientId, amount) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.default.transaction((trx) => __awaiter(void 0, void 0, void 0, function* () {
        const senderWallet = yield trx('wallets').where({ userId }).first();
        const recipientWallet = yield trx('wallets').where({ userId: recipientId }).first();
        if (!senderWallet || !recipientWallet)
            throw new Error('Wallet not found');
        if (senderWallet.balance < amount)
            throw new Error('Insufficient funds');
        yield trx('wallets').where({ userId }).update({ balance: (parseFloat(senderWallet.balance) - amount), updatedAt: new Date() });
        yield trx('wallets').where({ userId: recipientId }).update({ balance: parseFloat(recipientWallet.balance) + amount, updatedAt: new Date() });
        yield trx('transactions').insert({
            id: (0, uuid_1.v4)(),
            userId,
            type: 'TRANSFER',
            amount,
            recipientId,
            status: 'SUCCESS',
            createdAt: new Date()
        });
        return Object.assign(Object.assign({}, senderWallet), { balance: parseFloat(senderWallet.balance) - amount });
    }));
});
exports.transferFunds = transferFunds;
const withdrawFunds = (userId, amount) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.default.transaction((trx) => __awaiter(void 0, void 0, void 0, function* () {
        const wallet = yield trx('wallets').where({ userId }).first();
        if (!wallet)
            throw new Error('Wallet not found');
        if (wallet.balance < amount)
            throw new Error('Insufficient funds');
        const newBalance = parseFloat(wallet.balance) - amount;
        yield trx('wallets').where({ userId }).update({ balance: newBalance, updatedAt: new Date() });
        yield trx('transactions').insert({
            id: (0, uuid_1.v4)(),
            userId,
            type: 'WITHDRAW',
            amount,
            status: 'SUCCESS',
            createdAt: new Date()
        });
        return Object.assign(Object.assign({}, wallet), { balance: newBalance });
    }));
});
exports.withdrawFunds = withdrawFunds;
