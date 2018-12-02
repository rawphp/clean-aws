import * as AWS from 'aws-sdk';
import { ICleanOptions, IResourceCleaner, ISNSList } from '../types';
import { BaseResource } from './BaseResource';

export class SNS extends BaseResource implements IResourceCleaner {
  protected sns: AWS.SNS;
  public constructor(options: ICleanOptions) {
    super('SNS', options);

    this.sns =
      options.sns ||
      new AWS.SNS({
        region: options && options.region ? options.region : undefined,
      });
  }

  public async list(): Promise<object> {
    console.log('[SNS] Listing Topics & Subscriptions');

    this.emit('listStarted', { resource: this, region: this.region });

    try {
      const topicResponse = await this.sns.listTopics().promise();

      const subscriptionResponse = await this.sns.listSubscriptions().promise();

      const file: ISNSList = {
        region: this.region,
        profile: this.profile,
        topics:
          topicResponse && topicResponse.Topics
            ? topicResponse.Topics.map((topic: AWS.SNS.Topic) => topic.TopicArn as string)
            : [],
        subscriptions:
          subscriptionResponse && subscriptionResponse.Subscriptions
            ? subscriptionResponse.Subscriptions.map(
                (subscription: AWS.SNS.Subscription) => subscription.SubscriptionArn as string,
              )
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

  public async remove({ topics }: { topics: string[] }): Promise<number> {
    // try {
    //   const processes = subscriptions.map((subscription: string) => {
    //     return this.sns
    //       .unsubscribe({
    //         SubscriptionArn: subscription,
    //       })
    //       .promise();
    //   });
    //   await Promise.all(processes);
    //   const processes = topics.map((topic: string) => {
    //     return this.sns
    //       .deleteTopic({
    //         TopicArn: topic,
    //       })
    //       .promise();
    //   });
    //   await Promise.all(processes);
    //   return 0;
    // } catch (error) {
    //   console.error(error);
    //   return 1;
    // }
    return 0;
  }
}
