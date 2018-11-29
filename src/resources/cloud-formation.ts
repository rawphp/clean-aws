import * as AWS from 'aws-sdk';
import { ICleanOptions, IResourceCleaner } from '../types';

export interface ICloudFormationList {
  region: string;
  cloudFormationStacks: string[];
}

export class CloudFormation implements IResourceCleaner {
  protected cloudFormation: AWS.CloudFormation;
  protected region: string;

  public constructor(options: ICleanOptions) {
    this.region = options.region;

    this.cloudFormation = new AWS.CloudFormation({
      region: options && options.region ? options.region : '',
    });
  }

  public async list(): Promise<object> {
    console.log('[CloudFormation] Listing Stacks', this.region);

    try {
      let next: boolean | string = true;

      const file: ICloudFormationList = {
        region: this.region,
        cloudFormationStacks: [],
      };

      while (next) {
        const stacks = await this.cloudFormation.describeStacks().promise();

        if (stacks && stacks.Stacks) {
          stacks.Stacks.forEach((stack: AWS.CloudFormation.Stack) => {
            file.cloudFormationStacks.push(stack.StackName);
          });
        }

        next = false;

        if (stacks.NextToken) {
          next = stacks.NextToken;
        }
      }

      return file;
    } catch (error) {
      console.error(error);

      throw error;
    }
  }

  public async remove(stacks: string[]): Promise<number> {
    try {
      const processes = stacks.map((stack: string) => {
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
