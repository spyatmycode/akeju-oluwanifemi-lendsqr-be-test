"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../index"));
const db_1 = __importDefault(require("../config/db"));
const path = __importStar(require("path"));
const jest_mock_axios_1 = __importDefault(require("jest-mock-axios"));
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    jest_mock_axios_1.default.get.mockResolvedValue({ data: { blacklisted: false } }); // Here we are mocking the Adjutor API
    yield db_1.default.migrate.latest({
        directory: path.resolve(__dirname, '../migrations')
    });
}), 10000);
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    // We first clean up tables in the correct order (child tables first) to avoid foreign key errors.
    yield (0, db_1.default)('transactions').del();
    yield (0, db_1.default)('wallets').del();
    yield (0, db_1.default)('users').del();
    let userResponse;
    try {
        userResponse = yield (0, supertest_1.default)(index_1.default)
            .post('/users')
            .send({ name: 'John Doe', email: `john${Date.now()}@example.com` }); // Unique email for every test
        expect(userResponse.status).toBe(201);
        expect(userResponse.body).toHaveProperty('id');
    }
    catch (error) {
        console.error('User creation failed:', error);
        throw error; // Fail test if user creation fails
    }
    userId = userResponse.body.id;
    let recipientResponse;
    try {
        recipientResponse = yield (0, supertest_1.default)(index_1.default)
            .post('/users')
            .send({ name: 'Jane Doe', email: `jane${Date.now()}@example.com` }); // Unique email
        expect(recipientResponse.status).toBe(201);
        expect(recipientResponse.body).toHaveProperty('id');
    }
    catch (error) {
        console.error('Recipient creation failed:', error);
        throw error;
    }
    recipientId = recipientResponse.body.id;
}), 10000);
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    // Here we're cleaning up in the correct order before rollback
    yield (0, db_1.default)('transactions').del();
    yield (0, db_1.default)('wallets').del();
    yield (0, db_1.default)('users').del();
    yield db_1.default.migrate.rollback({
        directory: path.resolve(__dirname, '../migrations')
    });
    yield db_1.default.destroy();
    jest_mock_axios_1.default.reset();
}), 10000);
let userId;
let recipientId;
describe('Wallet API', () => {
    test('POST /wallets/fund - should fund wallet', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.default)
            .post('/wallets/fund')
            .set('Authorization', 'Bearer faux-token-123')
            .send({ userId, amount: 1000 });
        expect(response.status).toBe(200);
        expect(response.body.balance).toBe(1000);
    }), 10000);
    test('POST /wallets/fund - should fail without token', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.default)
            .post('/wallets/fund')
            .send({ userId, amount: 1000 });
        expect(response.status).toBe(401);
        expect(response.body.error).toBe('Invalid or missing token');
    }), 10000);
    test('POST /wallets/transfer - should transfer funds', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(index_1.default)
            .post('/wallets/fund')
            .set('Authorization', 'Bearer faux-token-123')
            .send({ userId, amount: 1000 });
        const response = yield (0, supertest_1.default)(index_1.default)
            .post('/wallets/transfer')
            .set('Authorization', 'Bearer faux-token-123')
            .send({ userId, recipientId, amount: 500 });
        expect(response.status).toBe(200);
        expect(response.body.balance).toBe(500);
    }), 10000);
    test('POST /wallets/transfer - should fail on insufficient funds', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(index_1.default)
            .post('/wallets/transfer')
            .set('Authorization', 'Bearer faux-token-123')
            .send({ userId, recipientId, amount: 500 });
        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Insufficient funds');
    }), 10000);
    test('POST /wallets/withdraw - should withdraw funds', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(index_1.default)
            .post('/wallets/fund')
            .set('Authorization', 'Bearer faux-token-123')
            .send({ userId, amount: 1000 });
        const response = yield (0, supertest_1.default)(index_1.default)
            .post('/wallets/withdraw')
            .set('Authorization', 'Bearer faux-token-123')
            .send({ userId, amount: 300 });
        expect(response.status).toBe(200);
        expect(response.body.balance).toBe(700);
    }), 10000);
});
