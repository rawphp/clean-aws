import * as AWS from 'aws-sdk';
import { ICleanOptions, ICloudWatchList, IResourceCleaner } from '../types';
import { BaseResource } from './BaseResource';

export class CloudWatch extends BaseResource implements IResourceCleaner {
  protected cloudWatch: AWS.CloudWatchLogs;

  public constructor(options: ICleanOptions) {
    super('CloudWatch', options);

    this.cloudWatch =
      options.cloudWatch ||
      new AWS.CloudWatchLogs({
        region: options && options.region ? options.region : undefined,
      });
  }

  public async list(): Promise<object> {
    console.log('[CloudWatch] Listing LogGroups');

    this.emit('listStarted', { resource: this, region: this.region });

    try {
      const response = await this.cloudWatch.describeLogGroups().promise();

      if (!response || !response.logGroups) {
        return { region: this.region, logGroups: [] };
      }

      const file: ICloudWatchList = {
        region: this.region,
        profile: this.profile,
        logGroups:
          response && response.logGroups
            ? response.logGroups.map((group: AWS.CloudWatchLogs.LogGroup) => group.logGroupName as string)
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

  public async remove({ logGroups }: { logGroups: string[] }): Promise<number> {
    try {
      const processes = logGroups.map((logGroup: string) => {
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
