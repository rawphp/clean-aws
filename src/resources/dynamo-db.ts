import * as AWS from 'aws-sdk';
import { ICleanOptions, IDynamoDbTableList, IResourceCleaner } from '../types';
import { BaseResource } from './BaseResource';

export class DynamoDb extends BaseResource implements IResourceCleaner {
  protected dynamoDb: AWS.DynamoDB;

  public constructor(options: ICleanOptions) {
    super('DynamoDb', options);

    this.dynamoDb =
      options.dynamoDb ||
      new AWS.DynamoDB({
        region: options && options.region ? options.region : undefined,
      });
  }

  public async list(): Promise<object> {
    console.log('[DynamoDb] Listing DynamoDb Tables');

    this.emit('listStarted', { resource: this, region: this.region });

    try {
      const response = await this.dynamoDb.listTables().promise();

      if (!response || !response.TableNames) {
        return { buckets: [] };
      }

      const file: IDynamoDbTableList = {
        region: this.region,
        profile: this.profile,
        tables:
          response && response.TableNames
            ? response.TableNames.map((table: AWS.DynamoDB.TableName) => table as string)
            : [],
      };

      return file;
    } catch (error) {
      console.error(error);

      throw error;
    } finally {
      this.emit('listCompleted', { resource: this, region: this.region });
    }
  }

  public async remove({ tables }: { tables: string[] }): Promise<number> {
    try {
      const processes = tables.map((name: string) => {
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
