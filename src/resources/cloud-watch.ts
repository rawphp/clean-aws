import * as AWS from 'aws-sdk';
import { ICleanOptions, IResourceCleaner } from '../types';

export interface ICloudWatchList {
  region: string;
  logGroups: string[];
}

export class CloudWatch implements IResourceCleaner {
  protected cloudWatch: AWS.CloudWatchLogs;
  protected region: string;

  public constructor(options: ICleanOptions) {
    this.region = options.region;
    this.cloudWatch =
      options.cloudWatch ||
      new AWS.CloudWatchLogs({
        region: options && options.region ? options.region : undefined,
      });
  }

  public async list(): Promise<object> {
    console.log('[CloudWatch] Listing LogGroups');

    try {
      const response = await this.cloudWatch.describeLogGroups().promise();

      if (!response || !response.logGroups) {
        return { buckets: [] };
      }

      const file: ICloudWatchList = {
        region: this.region,
        logGroups:
          response && response.logGroups
            ? response.logGroups.map((group: AWS.CloudWatchLogs.LogGroup) => group.logGroupName as string)
            : [],
      };

      return file;
    } catch (error) {
      console.error(error);

      throw error;
    }
  }

  public async remove(logGroupNames: string[]): Promise<number> {
    try {
      const processes = logGroupNames.map((logGroup: string) => {
        return this.cloudWatch
          .deleteLogGroup({
            logGroupName: logGroup,
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
