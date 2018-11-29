import * as BPromise from 'bluebird';
import * as colors from 'colors/safe';
import * as fs from 'fs-extra';
import { CloudFormation } from './resources/cloud-formation';
import { CloudWatch } from './resources/cloud-watch';
import { DataPipeline } from './resources/data-pipeline';
import { DynamoDb } from './resources/dynamo-db';
import { EC2 } from './resources/ec2';
import { IAM } from './resources/iam';
import { S3 } from './resources/s3';
import { SNS } from './resources/sns';
import { SQS } from './resources/sqs';
import { IResourceCleaner } from './types';

export const list = async (options: any) => {
  const resourceCleaners: IResourceCleaner[] = [];

  if (Array.isArray(options.region)) {
    console.log(colors.green(`Listig regions: ${options.region.join(', ')}`));

    const singleOpts = {
      ...options,
      region: options.region[0],
    };

    resourceCleaners.push(new S3(singleOpts));
    resourceCleaners.push(new IAM(singleOpts));

    options.region.forEach((region: string) => {
      const opts = {
        ...options,
        region,
      };

      resourceCleaners.push(new CloudWatch(opts));
      resourceCleaners.push(new CloudFormation(opts));
      resourceCleaners.push(new DataPipeline(opts));
      resourceCleaners.push(new DynamoDb(opts));
      resourceCleaners.push(new EC2(opts));
      resourceCleaners.push(new SNS(opts));
      resourceCleaners.push(new SQS(opts));
    });
  } else {
    resourceCleaners.push(new S3(options));
    resourceCleaners.push(new CloudFormation(options));
    resourceCleaners.push(new CloudWatch(options));
    resourceCleaners.push(new DataPipeline(options));
    resourceCleaners.push(new DynamoDb(options));
    resourceCleaners.push(new EC2(options));
    resourceCleaners.push(new IAM(options));
    resourceCleaners.push(new SNS(options));
    resourceCleaners.push(new SQS(options));
  }

  const allFiles = {};

  const resourceMaps = await BPromise.map(
    resourceCleaners,
    (resource: IResourceCleaner) => {
      try {
        return resource.list();
      } catch (error) {
        console.error(error);

        return {};
      }
    },
    { concurrency: 50 },
  );

  resourceMaps.forEach((file: any) => {
    if (!allFiles[file.region]) {
      allFiles[file.region] = {
        ...file,
      };
    } else {
      allFiles[file.region] = {
        ...allFiles[file.region],
        ...file,
      };
    }
  });

  console.log(allFiles);

  console.log(`Writing resources to ${options.outputFile}`);

  await fs.writeJson(options.outputFile, allFiles, { spaces: 2 });

  return 0;
};
