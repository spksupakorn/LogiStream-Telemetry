import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import { injectable, inject } from 'inversify';
import { TYPES } from '../di/types.js';

export interface ITransactionManager {
  runInTransaction<T>(work: (manager: EntityManager) => Promise<T>): Promise<T>;
}

@injectable()
export class TransactionManager implements ITransactionManager {
  constructor(
    @inject(TYPES.DataSource) private readonly dataSource: DataSource
  ) {}

  async runInTransaction<T>(work: (manager: EntityManager) => Promise<T>): Promise<T> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await work(queryRunner.manager);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
