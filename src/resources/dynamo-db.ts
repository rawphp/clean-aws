import * as AWS from 'aws-sdk';
import { ICleanOptions, IResourceCleaner } from '../types';

export interface IDynamoDbTableList {
  region: string;
  tables: string[];
}

export class DynamoDb implements IResourceCleaner {
  protected dynamoDb: AWS.DynamoDB;
  protected region: string;

  public constructor(options: ICleanOptions) {
    this.region = options.region;
    this.dynamoDb =
      options.dynamoDb ||
      new AWS.DynamoDB({
        region: options && options.region ? options.region : undefined,
      });
  }

  public async list(): Promise<object> {
    console.log('[DynamoDb] Listing DynamoDb Tables');

    try {
      const response = await this.dynamoDb.listTables().promise();

      if (!response || !response.TableNames) {
        return { buckets: [] };
      }

      const file: IDynamoDbTableList = {
        region: this.region,
        tables:
          response && response.TableNames
            ? response.TableNames.map((table: AWS.DynamoDB.TableName) => table as string)
            : [],
      };

      return file;
    } catch (error) {
      console.error(error);

      throw error;
    }
  }

  public async remove(tableNames: string[]): Promise<number> {
    try {
      const processes = tableNames.map((name: string) => {
        return this.dynamoDb
          .deleteTable({
            TableName: name,
          })
          .promise();
      });

      await Promise.all(processes);

      return 0;
    } catch (error) {
      console.error(error);

      return 1;
    }
  }
}
