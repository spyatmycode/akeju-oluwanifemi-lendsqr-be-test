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
const express_1 = require("express");
const walletService_1 = require("../services/walletService");
const router = (0, express_1.Router)();
router.post('/fund', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.body) === null || _a === void 0 ? void 0 : _a.userId;
        const amount = (_b = req.body) === null || _b === void 0 ? void 0 : _b.amount;
        if (!userId || !amount || amount <= 0)
            throw new Error('Invalid userId or amount');
        const wallet = yield (0, walletService_1.fundWallet)(userId, amount);
        res.json(wallet);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}));
router.post('/transfer', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const userId = (_a = req.body) === null || _a === void 0 ? void 0 : _a.userId;
        const recipientId = (_b = req.body) === null || _b === void 0 ? void 0 : _b.recipientId;
        const amount = (_c = req.body) === null || _c === void 0 ? void 0 : _c.amount;
        if (!userId || !recipientId || !amount || amount <= 0)
            throw new Error('Invalid userId, recipientId, or amount');
        if (userId === recipientId)
            throw new Error('Cannot transfer between the same user!');
        const wallet = yield (0, walletService_1.transferFunds)(userId, recipientId, amount);
        res.json(wallet);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}));
router.post('/withdraw', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, amount } = req.body;
        if (!userId || !amount || amount <= 0)
            throw new Error('Invalid userId or amount');
        const wallet = yield (0, walletService_1.withdrawFunds)(userId, amount);
        res.json(wallet);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
}));
exports.default = router;
