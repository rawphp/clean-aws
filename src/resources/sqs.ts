import * as AWS from 'aws-sdk';
import { ICleanOptions, IResourceCleaner, ISQSList } from '../types';
import { BaseResource } from './BaseResource';

export class SQS extends BaseResource implements IResourceCleaner {
  protected sqs: AWS.SQS;

  public constructor(options: ICleanOptions) {
    super('SNS', options);

    this.sqs =
      options.sqs ||
      new AWS.SQS({
        region: options && options.region ? options.region : undefined,
      });
  }

  public async list(): Promise<object> {
    console.log('[SQS] Listing SQS Queues');

    this.emit('listStarted', { resource: this, region: this.region });

    try {
      const queues = await this.sqs.listQueues().promise();

      if (!queues || !queues.QueueUrls) {
        return { region: this.region, queues: [] };
      }

      const file: ISQSList = {
        region: this.region,
        profile: this.profile,
        queues: queues && queues.QueueUrls ? queues.QueueUrls.map((url: string) => url) : [],
      };

      console.log('[SQS] Listing SQS Queues Completed');

      return file;
    } catch (error) {
      console.error(error);

      throw error;
    } finally {
      this.emit('listCompleted', { resource: this, region: this.region });
    }
  }

  public async remove({ queues }: { queues: string[] }): Promise<number> {
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
