import { Request, Response, Router } from 'express';
import { fundWallet, transferFunds, withdrawFunds } from '../services/walletService';

const router = Router();

router.post('/fund', async (req: Request, res: Response) => {
  try {
    const { userId, amount } = req.body;
    if (!userId || !amount || amount <= 0) throw new Error('Invalid userId or amount');
    const wallet = await fundWallet(userId, amount);
    res.json(wallet);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/transfer', async (req: Request, res: Response) => {
  try {
    const { userId, recipientId, amount } = req.body;
    if (!userId || !recipientId || !amount || amount <= 0) throw new Error('Invalid userId, recipientId, or amount');
    const wallet = await transferFunds(userId, recipientId, amount);
    res.json(wallet);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/withdraw', async (req: Request, res: Response) => {
  try {
    const { userId, amount } = req.body;
    if (!userId || !amount || amount <= 0) throw new Error('Invalid userId or amount');
    const wallet = await withdrawFunds(userId, amount);
    res.json(wallet);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;