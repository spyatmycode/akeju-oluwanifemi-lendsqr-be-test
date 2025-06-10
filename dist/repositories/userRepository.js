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
exports.createUser = void 0;
const uuid_1 = require("uuid");
const db_1 = __importDefault(require("../config/db"));
const axios_1 = __importDefault(require("axios"));
const createUser = (name, email) => __awaiter(void 0, void 0, void 0, function* () {
    let karmaStatus = 'clean';
    const response = yield axios_1.default.get(`https://adjutor.lendsqr.com/v2/verification/karma/${email}`, {
        headers: { Authorization: `Bearer ${process.env.ADJUTOR_API_KEY}` },
    });
    karmaStatus = response.data.blacklisted ? 'blacklisted' : 'clean';
    if (karmaStatus === 'blacklisted')
        throw new Error('User is blacklisted by Lendsqr Adjutor Karma');
    const existing = yield (0, db_1.default)('users').where({
        email
    }).first();
    if (existing)
        throw new Error("This user already exists");
    const user = { id: (0, uuid_1.v4)(), name, email, karmaStatus, createdAt: new Date() };
    yield (0, db_1.default)('users').insert(user);
    yield (0, db_1.default)('wallets').insert({ id: (0, uuid_1.v4)(), userId: user.id, balance: 0, updatedAt: new Date() });
    return user;
});
exports.createUser = createUser;
