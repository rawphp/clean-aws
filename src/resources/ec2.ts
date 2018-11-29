import * as AWS from 'aws-sdk';
import { ICleanOptions, IResourceCleaner } from '../types';

export interface IEC2List {
  region: string;
  ec2s: string[];
}

export class EC2 implements IResourceCleaner {
  protected ec2: AWS.EC2;
  protected region: string;

  public constructor(options: ICleanOptions) {
    this.region = options.region;
    this.ec2 =
      options.ec2 ||
      new AWS.EC2({
        region: options && options.region ? options.region : undefined,
      });
  }

  public async list(): Promise<object> {
    console.log('[EC2] Listing EC2 Instances');

    try {
      const response = await this.ec2.describeInstances().promise();

      if (!response || !response.Reservations) {
        return { buckets: [] };
      }

      const file: IEC2List = {
        region: this.region,
        ec2s: [],
      };

      if (response && response.Reservations) {
        response.Reservations.map((reservation: AWS.EC2.Reservation) => {
          (reservation.Instances as AWS.EC2.Instance[]).forEach((instance) => {
            if (instance) {
              file.ec2s.push(instance.InstanceId as string);
            }
          });
        });
      }

      return file;
    } catch (error) {
      console.error(error);

      throw error;
    }
  }

  public async remove(instanceIds: string[]): Promise<number> {
    try {
      await this.ec2
        .terminateInstances({
          InstanceIds: instanceIds,
        })
        .promise();

      return 0;
    } catch (error) {
      console.error(error);

      return 1;
    }
  }
}
