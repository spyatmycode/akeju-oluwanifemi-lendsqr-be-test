import dotenv from "dotenv";
dotenv.config({})
import express, { Request, Response } from 'express';
import { errorHandler } from './middleware/error';
import userRoutes from './controllers/userController';
import walletRoutes from './controllers/walletController';
import { authMiddleware } from './middleware/auth';

const app = express();
app.use(express.json());
app.get('/', (req: Request, res: Response) => { 
    res.status(200).json({ message: "Welcome to Oluwanifemi's Lendsqr Backend Assessment" }) 
    return
})
app.use('/users', userRoutes);
app.use('/wallets', authMiddleware, walletRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app