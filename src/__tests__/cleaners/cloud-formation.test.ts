import * as AWS from 'aws-sdk';
import * as nock from 'nock';
import { CloudFormation } from '../../cleaners/cloud-formation';
import { IProviderOptions, IResourceCleaner } from '../../types';
import * as describeStacksResponse from '../fixtures/describe-stacks-response.json';

describe('CloudFormation', () => {
  let resource: IResourceCleaner;
  let cf: AWS.CloudFormation;

  const options: IProviderOptions = {
    profile: 'default',
    region: 'ap-southeast-2',
    dryRun: false,
    resourceFile: 'resources.json',
  };

  beforeEach(() => {
    nock.disableNetConnect();
    // nock('https://cloudformation.ap-southeast-2.amazonaws.com').post('/').reply(200, {});

    cf = new AWS.CloudFormation({ region: options.region });

    options.cloudFormation = cf;

    cf.describeStacks = jest.fn().mockReturnValueOnce({
      promise: () => describeStacksResponse,
    });

    resource = new CloudFormation(options);
  });

  afterEach(() => {
    nock.enableNetConnect();
    jest.restoreAllMocks();
  });

  describe('toString', () => {
    it('toString returns correct value', () => {
      expect(resource.toString()).toEqual('CloudFormation-default-ap-southeast-2');
    });
  });

  describe('list', () => {
    it('lists stacks successfully', async () => {
      await resource.list();

      expect(resource.getData()).toMatchSnapshot();
    });

    it('emits listStarted event', async () => {
      let started = false;

      resource.on('listStarted', (data) => {
        started = true;
      });

      await resource.list();

      expect(started).toEqual(true);
    });

    it('emits listCompleted event', async () => {
      let completed = false;

      resource.on('listCompleted', (data) => {
        completed = true;
      });

      await resource.list();

      expect(completed).toEqual(true);
    });
  });

  describe('remove', () => {
    it('skips non-existent stacks', async () => {
      const stacks = ['tdk-test-stack'];

      resource = new CloudFormation({
        ...options,
        stacks,
      });

      expect(await resource.remove()).toEqual(true);
    });

    it('successfully removes a stack', async () => {
      const stacks = ['ups-v3-tdk'];

      resource = new CloudFormation({
        ...options,
        stacks,
      });

      cf.deleteStack = jest.fn().mockReturnValueOnce({
        promise: () => ({
          ResponseMetadata: {
            RequestId: '49f2b134-8bd4-11e9-bdf1-519eaf8997bd',
          },
        }),
      });

      cf.describeStacks = jest
        .fn()
        .mockReturnValueOnce({
          promise: () => ({
            ResponseMetadata: { RequestId: '4b559c28-8bd4-11e9-85bd-c122c3e7f8c1' },
            Stacks: [
              {
                // tslint:disable-next-line:max-line-length
                StackId: 'arn:aws:cloudformation:ap-southeast-2:159931620759:stack/ups-v3-tdk/a165c3f0-f2df-11e8-aa1d-0ab1e239639c',
                StackName: 'ups-v3-tdk',
                Description: 'The AWS CloudFormation template for this Serverless application',
                Parameters: [],
                CreationTime: '2018-11-28T07:31:33.431Z',
                DeletionTime: '2019-06-10T23:05:50.259Z',
                LastUpdatedTime: '2019-03-05T03:30:01.815Z',
                RollbackConfiguration: {},
                StackStatus: 'DELETE_IN_PROGRESS',
                DisableRollback: false,
                NotificationARNs: [],
                Capabilities: ['CAPABILITY_IAM', 'CAPABILITY_NAMED_IAM'],
                Outputs: [
                  {
                    OutputKey: 'MarcoLambdaFunctionQualifiedArn',
                    OutputValue: 'arn:aws:lambda:ap-southeast-2:159931620759:function:ups-v3-tdk-marco:15',
                    Description: 'Current Lambda function version',
                  },
                  {
                    OutputKey: 'TrackingLambdaFunctionQualifiedArn',
                    OutputValue: 'arn:aws:lambda:ap-southeast-2:159931620759:function:ups-v3-tdk-tracking:15',
                    Description: 'Current Lambda function version',
                  },
                  {
                    OutputKey: 'BookingLambdaFunctionQualifiedArn',
                    OutputValue: 'arn:aws:lambda:ap-southeast-2:159931620759:function:ups-v3-tdk-booking:15',
                    Description: 'Current Lambda function version',
                  },
                  {
                    OutputKey: 'RegisterLambdaFunctionQualifiedArn',
                    OutputValue: 'arn:aws:lambda:ap-southeast-2:159931620759:function:ups-v3-tdk-register:15',
                    Description: 'Current Lambda function version',
                  },
                  {
                    OutputKey: 'PaperlessLambdaFunctionQualifiedArn',
                    OutputValue: 'arn:aws:lambda:ap-southeast-2:159931620759:function:ups-v3-tdk-paperless:15',
                    Description: 'Current Lambda function version',
                  },
                  {
                    OutputKey: 'QuoteLambdaFunctionQualifiedArn',
                    OutputValue: 'arn:aws:lambda:ap-southeast-2:159931620759:function:ups-v3-tdk-quote:15',
                    Description: 'Current Lambda function version',
                  },
                  // tslint:disable-next-line:max-line-length
                  { OutputKey: 'ServerlessDeploymentBucketName', OutputValue: 'ups-v3-tdk-serverlessdeploymentbucket-f7h6ngs32no' },
                  {
                    OutputKey: 'MetaLambdaFunctionQualifiedArn',
                    OutputValue: 'arn:aws:lambda:ap-southeast-2:159931620759:function:ups-v3-tdk-meta:15',
                    Description: 'Current Lambda function version',
                  },
                  {
                    OutputKey: 'IamRoleArnLambda',
                    OutputValue: 'arn:aws:iam::159931620759:role/ups-v3-tdk-IamRoleLambda-17FY68BTVCPHY',
                    Description: 'ARN of the lambda IAM role',
                  },
                  {
                    OutputKey: 'LicenseLambdaFunctionQualifiedArn',
                    OutputValue: 'arn:aws:lambda:ap-southeast-2:159931620759:function:ups-v3-tdk-license:15',
                    Description: 'Current Lambda function version',
                  },
                  {
                    OutputKey: 'EulaLambdaFunctionQualifiedArn',
                    OutputValue: 'arn:aws:lambda:ap-southeast-2:159931620759:function:ups-v3-tdk-eula:15',
                    Description: 'Current Lambda function version',
                  },
                  {
                    OutputKey: 'CompletionLambdaFunctionQualifiedArn',
                    OutputValue: 'arn:aws:lambda:ap-southeast-2:159931620759:function:ups-v3-tdk-completion:15',
                    Description: 'Current Lambda function version',
                  },
                  {
                    OutputKey: 'CollectionPointLambdaFunctionQualifiedArn',
                    OutputValue: 'arn:aws:lambda:ap-southeast-2:159931620759:function:ups-v3-tdk-collectionPoint:15',
                    Description: 'Current Lambda function version',
                  },
                  {
                    OutputKey: 'ServiceEndpoint',
                    OutputValue: 'https://yxsgif1eeh.execute-api.ap-southeast-2.amazonaws.com/tdk',
                    Description: 'URL of the service endpoint',
                  },
                ],
                Tags: [{ Key: 'STAGE', Value: 'tdk' }],
                EnableTerminationProtection: false,
                DriftInformation: { StackDriftStatus: 'NOT_CHECKED' },
              },
            ],
          }),
        })
        .mockReturnValueOnce({
          promise: () => {
            throw new Error('problem occurred');
          },
        });

      expect(await resource.remove()).toEqual(true);
    });
  });
});
