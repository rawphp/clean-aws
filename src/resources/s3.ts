import * as AWS from 'aws-sdk';
import { ICleanOptions, IResourceCleaner } from '../types';

export interface IBucketsList {
  region: string;
  buckets: string[];
}

export class S3 implements IResourceCleaner {
  protected s3: AWS.S3;
  protected region: string;

  public constructor(options: ICleanOptions) {
    this.region = options.region;
    this.s3 =
      options.s3 ||
      new AWS.S3({
        region: options && options.region ? options.region : undefined,
      });
  }

  public async list(): Promise<object> {
    console.log('[S3] Listing Buckets');

    try {
      const response = await this.s3.listBuckets().promise();

      if (!response || !response.Buckets) {
        return { buckets: [] };
      }

      const file: IBucketsList = {
        region: this.region,
        buckets:
          response && response.Buckets ? response.Buckets.map((bucket: AWS.S3.Bucket) => bucket.Name as string) : [],
      };

      return file;
    } catch (error) {
      console.error(error);

      throw error;
    }
  }

  public async remove(buckets: string[]): Promise<number> {
    try {
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
