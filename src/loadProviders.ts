import * as colors from 'colors/safe';
import { CloudFormation } from './cleaners/cloud-formation';
// import { CloudWatch } from './cleaners/cloud-watch';
// import { DataPipeline } from './cleaners/data-pipeline';
// import { DynamoDb } from './cleaners/dynamo-db';
// import { EC2 } from './cleaners/ec2';
// import { IAM } from './cleaners/iam';
import { S3 } from './cleaners/s3';
// import { SNS } from './cleaners/sns';
// import { SQS } from './cleaners/sqs';
import { IResourceCleaner } from './types';

export const loadProviders = (options: any): IResourceCleaner[] => {
  const providers: IResourceCleaner[] = [];

  if (Array.isArray(options.region)) {
    console.log(colors.green(`Listing regions: ${options.region.join(', ')}`));

    const singleOpts = {
      ...options,
      region: options.region[0],
    };

    providers.push(new S3(singleOpts));
    // providers.push(new IAM(singleOpts));

    options.region.forEach((region: string) => {
      const opts = {
        ...options,
        region,
      };

      providers.push(new CloudFormation(opts));
      // providers.push(new CloudWatch(opts));
      // providers.push(new DataPipeline(opts));
      // providers.push(new DynamoDb(opts));
      // providers.push(new EC2(opts));
      // providers.push(new SNS(opts));
      // providers.push(new SQS(opts));
    });
  } else {
    providers.push(new S3(options));
    providers.push(new CloudFormation(options));
    // providers.push(new CloudWatch(options));
    // providers.push(new DataPipeline(options));
    // providers.push(new DynamoDb(options));
    // providers.push(new EC2(options));
    // providers.push(new IAM(options));
    // providers.push(new SNS(options));
    // providers.push(new SQS(options));
  }

  return providers;
};
