import { Request, Response, Router } from 'express';
import { createUser } from '../repositories/userRepository';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) throw new Error('Name and email are required');
    const user = await createUser(name, email);
    res.status(201).json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});


export default router;