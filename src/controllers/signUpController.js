import bcrypt from 'bcrypt';

import { database as db } from '../databases/mongo.js';
import httpStatus from '../utils/httpStatus.js';

const SALT_OR_ROUNDS = 10;

const insertSignUpInfos = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const encryptedPassword = bcrypt.hashSync(password, SALT_OR_ROUNDS);
    const newAccount = {
      name,
      email,
      password: encryptedPassword,
    };

    await db.collection('accounts').insertOne(newAccount);
    return res.status(httpStatus.CREATED).send('Conta criada com sucesso!');
  } catch (err) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).send('Erro ao criar conta!');
  }
};

export default insertSignUpInfos;
