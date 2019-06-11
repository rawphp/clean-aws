import * as AWS from 'aws-sdk';
import * as nock from 'nock';
import { S3 } from '../../cleaners/s3';
import { IResourceCleaner, IS3Options } from '../../types';
import * as listBucketsJson from '../fixtures/list-buckets.json';
import * as listObjectsSingleResponse from '../fixtures/list-objects-single.json';
import * as listVersionsResponse from '../fixtures/list-versions-response.json';

describe('S3', () => {
  let resource: IResourceCleaner;
  let s3;

  const options: IS3Options = {
    profile: 'default',
    region: 'ap-southeast-2',
    dryRun: false,
    resourceFile: 'resources.json',
  };

  beforeEach(() => {
    nock.disableNetConnect();

    s3 = new AWS.S3({ region: options.region });

    options.s3 = s3;

    s3.listBuckets = jest.fn().mockReturnValueOnce({
      promise: () => listBucketsJson,
    });

    resource = new S3(options);
  });

  afterEach(() => {
    nock.enableNetConnect();
    jest.restoreAllMocks();
  });

  describe('toString', () => {
    it('toString returns correct value', () => {
      expect(resource.toString()).toEqual('S3-default-ap-southeast-2');
    });
  });

  describe('list', () => {
    it('returns false if s3 response fails', async () => {
      s3.listBuckets = jest.fn().mockReturnValueOnce({
        promise: () => null,
      });

      expect(await resource.list()).toEqual(false);
    });

    it('list buckets', async () => {
      const buckets = await resource.list();

      expect(buckets).toEqual(true);
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
    it('skips non-existent bucket', async () => {
      const buckets = ['tdk-test-bucket-1078934'];

      resource = new S3({
        ...options,
        buckets,
      });

      expect(await resource.remove()).toEqual(true);
    });

    it('deletes objects including versions successfully', async () => {
      const buckets = ['test-bucket-08fa34b4-f3ef-4e0c-88e9-4dfd67ae0f14'];

      resource = new S3({
        ...options,
        buckets,
      });

      s3.listObjectsV2 = jest.fn().mockReturnValueOnce({
        promise: () => listObjectsSingleResponse,
      });

      s3.listObjectVersions = jest.fn().mockReturnValueOnce({
        promise: () => listVersionsResponse,
      });

      s3.deleteObject = jest
        .fn()
        .mockReturnValueOnce({
          promise: () => ({ DeleteMarker: true, VersionId: 'r2XYKmhTTbMQdtWtprQdra0WAkk6wlYS' }),
        })
        .mockReturnValueOnce({
          promise: () => ({ VersionId: 'PEYnM6liAvEg7vgNWG0At1kGa3iKO9a0' }),
        })
        .mockReturnValueOnce({
          promise: () => ({ VersionId: 'PEYnM6liAvEg7vgNWG0At1kGa3iKO9a0' }),
        })
        .mockReturnValueOnce({
          promise: () => ({ DeleteMarker: true, VersionId: 'r2XYKmhTTbMQdtWtprQdra0WAkk6wlYS' }),
        });

      s3.deleteBucket = jest.fn().mockReturnValueOnce({
        promise: () => ({}),
      });

      expect(await resource.remove()).toEqual(true);
    });
  });
});
