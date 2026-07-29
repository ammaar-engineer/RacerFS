import type { DataSource } from 'typeorm';
import { ConflictException } from '../CustomExceptionHandle';

type RepositoryInstance = ReturnType<DataSource['getRepository']>;
type SqliteErrorObjectKeys = 'SQLITE_CONSTRAINT_UNIQUE';

export async function SqliteHandle<P>(
  RepoIns: RepositoryInstance,
  callbackAction: (RepoInsCb: RepositoryInstance) => P | Promise<P>,
  customConfig?: Record<SqliteErrorObjectKeys, () => void>,
): Promise<P> {
  try {
    return await callbackAction(RepoIns);
  } catch (err: any) {
    const errorCode = err?.driverError?.code;
    const SqliteErrorObject: Record<SqliteErrorObjectKeys, () => void> = {
      SQLITE_CONSTRAINT_UNIQUE: () => {
        throw new ConflictException('Data already exist');
      },
      ...(customConfig as any),
    };
    
    if (errorCode && (SqliteErrorObject as any)[errorCode]) {
      (SqliteErrorObject as any)[errorCode]();
    }
    
    throw err;
  }
}
