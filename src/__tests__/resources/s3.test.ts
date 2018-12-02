import * as AWS from 'aws-sdk-mock';
import { S3 } from '../../resources/s3';
import { IResourceCleaner } from '../../types';
import * as listBucketsJson from '../fixtures/list-buckets.json';

describe('S3 resources', () => {
  let resource: IResourceCleaner;

  const options = {
    profile: 'default',
    region: 'ap-southeast-2',
    dryRun: false,
    resourceFile: 'resources.json',
  };

  beforeEach(() => {
    AWS.mock('S3', 'listBuckets', listBucketsJson);

    resource = new S3(options);
  });

  afterEach(() => {
    AWS.restore('S3');
  });

  test('list buckets', async () => {
    const buckets = await resource.list();

    expect(buckets).toMatchSnapshot();
  });
});
