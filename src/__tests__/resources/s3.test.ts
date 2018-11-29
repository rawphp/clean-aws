import { S3 } from '../../resources/s3';
import { IResourceCleaner } from '../../types';

describe('S3 resources', () => {
  let resource: IResourceCleaner;

  const options = {
    profile: 'default',
    region: 'ap-southeast-2',
  };

  beforeEach(() => {
    resource = new S3(options);
  });

  test('list buckets', async () => {
    const buckets = await resource.list();

    console.log('buckets', buckets);
  });
});
