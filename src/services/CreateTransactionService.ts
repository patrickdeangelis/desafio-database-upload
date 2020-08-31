import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: string;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category: categoryName,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    if (!title) {
      throw new AppError('Transaction should have a title');
    }

    if (!['income', 'outcome'].includes(type)) {
      throw new AppError('Type should be income or outcome');
    }

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && value > total) {
      throw new AppError("Don't have enought balance");
    }

    const findCategory = await categoriesRepository.findOne({
      where: { title: categoryName },
    });

    let category = findCategory;

    if (!category) {
      category = categoriesRepository.create({
        title: categoryName,
      });

      await categoriesRepository.save(category);
    }

    const transaction = transactionsRepository.create({
      title,
      type: type as 'income' | 'outcome',
      category,
      value,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
