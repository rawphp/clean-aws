import * as AWS from 'aws-sdk';
import { isBoolean } from 'util';
import { ICleanOptions, ICloudFormationList, IResourceCleaner } from '../types';
import { BaseResource } from './BaseResource';

export class CloudFormation extends BaseResource implements IResourceCleaner {
  protected cloudFormation: AWS.CloudFormation;

  public constructor(options: ICleanOptions) {
    super('CloudFormation', options);

    this.cloudFormation =
      options.cloudFormation ||
      new AWS.CloudFormation({
        region: options && options.region ? options.region : '',
      });
  }

  public async list(): Promise<object> {
    console.log('[CloudFormation] Listing Stacks', this.region);

    this.emit('listStarted', { resource: this, region: this.region });

    try {
      let next: boolean | string | undefined = true;

      const file: ICloudFormationList = {
        region: this.region,
        profile: this.profile,
        cloudFormationStacks: [],
      };

      while (next) {
        if (isBoolean(next)) {
          next = undefined;
        }

        const stacks = await this.cloudFormation
          .describeStacks({
            NextToken: next as string,
          })
          .promise();

        if (stacks && stacks.Stacks) {
          stacks.Stacks.forEach((stack: AWS.CloudFormation.Stack) => {
            file.cloudFormationStacks.push(stack.StackName);
          });
        }

        next = false;

        if (stacks.NextToken) {
          console.log('has NextToken', stacks.NextToken);

          next = stacks.NextToken;
        }
      }

      return file;
    } catch (error) {
      console.error(error);

      throw error;
    } finally {
      this.emit('listCompleted', { resource: this, region: this.region });
    }
  }

  public async remove({ cloudFormationStacks }: { cloudFormationStacks: string[] }): Promise<number> {
    try {
      const processes = cloudFormationStacks.map((stack: string) => {
        return this.cloudFormation
          .deleteStack({
            StackName: stack,
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
