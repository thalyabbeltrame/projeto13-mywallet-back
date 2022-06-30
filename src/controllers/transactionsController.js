import dayjs from 'dayjs';
import { ObjectId } from 'mongodb';

import { database as db } from '../databases/mongo.js';
import { getBalance } from '../utils/balance.js';
import { httpStatus } from '../utils/httpStatus.js';

const insertTransaction = async (req, res) => {
  const { amount, description, type } = req.body;
  const { userId } = res.locals.session;

  const newTransaction = {
    amount,
    description,
    type,
    date: dayjs().format('DD/MM'),
    userId,
  };

  try {
    await db.collection('transactions').insertOne(newTransaction);
    res.status(httpStatus.CREATED).send('Transação realizada com sucesso!');
  } catch (err) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send('Erro ao salvar a transação!');
  }
};

const getTransaction = async (_, res) => {
  const { userId } = res.locals.session;
  try {
    const transactions = await db.collection('transactions').find({ userId }).toArray();
    const balance = await getBalance(userId);
    res.status(httpStatus.OK).send({ transactions, balance });
  } catch (err) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send('Erro ao obter as transações!');
  }
};

const deleteTransaction = async (req, res) => {
  const { userId } = res.locals.session;
  const transactionId = new ObjectId(req.params.transactionId);
  try {
    const transaction = await db.collection('transactions').findOne({ _id: transactionId });
    if (!transaction) return res.status(httpStatus.NOT_FOUND).send('Id da transação não encontrado!');
    if (transaction.userId !== userId)
      return res.status(httpStatus.UNAUTHORIZED).send('Você não tem permissão para deletar essa transação!');

    await db.collection('transactions').deleteOne({ _id: transactionId });
    res.status(httpStatus.OK).send('Transação deletada com sucesso!');
  } catch (err) {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send('Erro ao deletar a transação!');
  }
};
