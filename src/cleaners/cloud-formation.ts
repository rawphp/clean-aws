import * as AWS from 'aws-sdk';
import * as BPromise from 'bluebird';
import * as colors from 'colors/safe';
import { isBoolean } from 'util';
import { IProviderOptions, IResourceCleaner } from '../types';
import { Provider } from './Provider';

export class CloudFormation extends Provider implements IResourceCleaner {
  protected cloudFormation: AWS.CloudFormation;
  protected stacks: string[];

  public constructor(options: IProviderOptions) {
    super('CloudFormation', options);

    this.stacks = options && options.stacks || [];
    this.cloudFormation = options.cloudFormation || new AWS.CloudFormation({
      region: this.region,
    });
  }

  public getData(): any {
    return this.stacks;
  }

  public async list(): Promise<boolean> {
    console.log('[CloudFormation] Listing Stacks', this.region);

    this.emit('listStarted', { resource: this, region: this.region });

    try {
      let next: boolean | string | undefined = true;

      while (next) {
        if (isBoolean(next)) {
          next = undefined;
        }

        const stacks = await this.cloudFormation.describeStacks({
          NextToken: next as string,
        }).promise();

        if (stacks && stacks.Stacks) {
          stacks.Stacks.forEach((stack: AWS.CloudFormation.Stack) => {
            this.stacks.push(stack.StackName);
          });
        }

        next = false;

        if (stacks.NextToken) {
          console.log('has NextToken', stacks.NextToken);

          next = stacks.NextToken;
        }
      }

      this.emit('listCompleted', { resource: this, region: this.region, data: { stacks: this.stacks } });

      return true;
    } catch (error) {
      console.error(error);

      throw error;
    }
  }

  public async remove(): Promise<boolean> {
    console.log('[CloudFormation] Deleting Stacks');

    try {
      this.emit('deleteStarted', { resource: this, region: this.region, data: { stacks: this.stacks } });

      if (this.dryRun) {
        console.log('[CloudFormation] Dry Run');

        return true;
      }

      await BPromise.map(this.stacks, async (stack: string) => {
        try {
          await this.cloudFormation.deleteStack({
            StackName: stack,
          }).promise();

          // poll completion
          let complete: boolean = false;

          do {
            try {
              await BPromise.delay(1000 * 2);

              const exists = await this.cloudFormation.describeStacks({
                StackName: stack,
              }).promise();

              complete = exists.Stacks && exists.Stacks.length > 0 ? false : true;
            } catch (error) {
              console.error(colors.yellow(error.message));

              complete = true;
            }
          } while (!complete);

        } catch (error) {
          console.error(colors.red(error.message));
        }
      }, { concurrency: 4 });

      this.emit('deleteCompleted', { resource: this, region: this.region, data: { stacks: this.stacks } });

      return true;
    } catch (error) {
      console.error(colors.red(error.message));

      return false;
    }
  }
}
