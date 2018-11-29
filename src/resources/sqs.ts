import * as AWS from 'aws-sdk';
import { ICleanOptions, IResourceCleaner } from '../types';

export interface ISQSList {
  region: string;
  queues: string[];
}

export class SQS implements IResourceCleaner {
  protected sqs: AWS.SQS;
  protected region: string;

  public constructor(options: ICleanOptions) {
    this.region = options.region;
    this.sqs =
      options.sqs ||
      new AWS.SQS({
        region: options && options.region ? options.region : undefined,
      });
  }

  public async list(): Promise<object> {
    console.log('[SQS] Listing SQS Queues');

    try {
      const queues = await this.sqs.listQueues().promise();

      if (!queues || !queues.QueueUrls) {
        return { topics: [] };
      }

      const file: ISQSList = {
        region: this.region,
        queues: queues && queues.QueueUrls ? queues.QueueUrls.map((url: string) => url) : [],
      };

      return file;
    } catch (error) {
      console.error(error);

      throw error;
    }
  }

  public async remove(queues: string[]): Promise<number> {
    try {
      const processes = queues.map((queue: string) => {
        return this.sqs
          .deleteQueue({
            QueueUrl: queue,
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
