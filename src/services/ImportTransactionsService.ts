import csvParse from 'csv-parse/lib/sync';
import fs from 'fs';
import path from 'path';
import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  filename: string;
}

interface RawTransaction {
  title: string;
  type: string;
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute({ filename }: Request): Promise<Transaction[]> {
    const createTransactionService = new CreateTransactionService();
    const filePath = path.resolve(uploadConfig.directory, filename);
    const file = await fs.promises.readFile(filePath);

    const rawTransactions = csvParse(file, {
      columns: true,
      trim: true,
      cast: true,
    }) as RawTransaction[];

    const transactions: Transaction[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const { title, type, category, value } of rawTransactions) {
      // eslint-disable-next-line no-await-in-loop
      const transaction = await createTransactionService.execute({
        title,
        type,
        category,
        value,
      });

      transactions.push(transaction);
    }

    await fs.promises.unlink(filePath);

    return transactions;
  }
}

export default ImportTransactionsService;
