import { v4 as uuidv4 } from 'uuid';
import knex from '../config/db';
import { User } from '../models/user';
import axios from 'axios';

export const createUser = async (name: string, email: string): Promise<User> => {
  
  let karmaStatus = 'clean';
  const response = await axios.get(`https://adjutor.lendsqr.com/v2/verification/karma/${email}`, {
    headers: { Authorization: `Bearer ${process.env.ADJUTOR_API_KEY}` },
  });



  karmaStatus = response.data.blacklisted ? 'blacklisted' : 'clean';

  
  if (karmaStatus === 'blacklisted') throw new Error('User is blacklisted by Lendsqr Adjutor Karma');

  const existing = await knex('users').where({
    email
  }).first()

  if(existing) throw new Error("This user already exists")

  const user = { id: uuidv4(), name, email, karmaStatus, createdAt: new Date() } as User;
  await knex('users').insert(user);
  await knex('wallets').insert({ id: uuidv4(), userId: user.id, balance: 0, updatedAt: new Date() });
  return user;
};