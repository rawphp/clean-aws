import * as AWS from 'aws-sdk';
import { IBucketsList, ICleanOptions, IResourceCleaner } from '../types';
import { BaseResource } from './BaseResource';

export class S3 extends BaseResource implements IResourceCleaner {
  protected s3: AWS.S3;

  public constructor(options: ICleanOptions) {
    super('S3', options);

    this.s3 =
      options.s3 ||
      new AWS.S3({
        region: options && options.region ? options.region : undefined,
      });
  }

  public async list(): Promise<object> {
    console.log('[S3] Listing Buckets');

    this.emit('listStarted', { resource: this, region: this.region });

    try {
      const response = await this.s3.listBuckets().promise();

      if (!response || !response.Buckets) {
        return { buckets: [] };
      }

      const file: IBucketsList = {
        region: this.region,
        profile: this.profile,
        buckets:
          response && response.Buckets ? response.Buckets.map((bucket: AWS.S3.Bucket) => bucket.Name as string) : [],
      };

      return file;
    } catch (error) {
      console.error(error);

      throw error;
    } finally {
      this.emit('listCompleted', { resource: this, region: this.region });
    }
  }

  public async remove({ buckets }: { buckets: string[] }): Promise<number> {
    try {
      if (this.dryRun) {
        console.log('Dry Run');
        console.log('Deleting', buckets);

        return 0;
      }

      const processes = buckets.map((bucket: string) => {
        return this.s3
          .deleteBucket({
            Bucket: bucket,
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
