import * as AWS from 'aws-sdk';
import { ICleanOptions, IEC2List, IResourceCleaner } from '../types';
import { BaseResource } from './BaseResource';

export class EC2 extends BaseResource implements IResourceCleaner {
  protected ec2: AWS.EC2;

  public constructor(options: ICleanOptions) {
    super('EC2', options);

    this.ec2 =
      options.ec2 ||
      new AWS.EC2({
        region: options && options.region ? options.region : undefined,
      });
  }

  public async list(): Promise<object> {
    console.log('[EC2] Listing EC2 Instances');

    this.emit('listStarted', { resource: this, region: this.region });

    try {
      const response = await this.ec2.describeInstances().promise();

      if (!response || !response.Reservations) {
        return { buckets: [] };
      }

      const file: IEC2List = {
        region: this.region,
        profile: this.profile,
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
    } finally {
      this.emit('listCompleted', { resource: this, region: this.region });
    }
  }

  public async remove({ ec2s }: { ec2s: string[] }): Promise<number> {
    try {
      await this.ec2
        .terminateInstances({
          InstanceIds: ec2s,
        })
        .promise();

      return 0;
    } catch (error) {
      console.error(error);

      return 1;
    }
  }
}
