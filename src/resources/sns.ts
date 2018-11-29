import * as AWS from 'aws-sdk';
import { ICleanOptions, IResourceCleaner } from '../types';

export interface ISNSList {
  region: string;
  topics: string[];
  subscriptions: string[];
}

export class SNS implements IResourceCleaner {
  protected sns: AWS.SNS;
  protected region: string;

  public constructor(options: ICleanOptions) {
    this.region = options.region;
    this.sns =
      options.sns ||
      new AWS.SNS({
        region: options && options.region ? options.region : undefined,
      });
  }

  public async list(): Promise<object> {
    console.log('[SNS] Listing Topics & Subscriptions');

    try {
      const topicResponse = await this.sns.listTopics().promise();

      // if (!topicResponse || !topicResponse.Topics) {
      //   return { topics: [] };
      // }

      const subscriptionResponse = await this.sns.listSubscriptions().promise();

      const file: ISNSList = {
        region: this.region,
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
    }
  }

  public async remove(topics: string[]): Promise<number> {
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
