import * as AWS from 'aws-sdk';
import * as BPromise from 'bluebird';
import * as colors from 'colors/safe';
import { IResourceCleaner, IS3Options } from '../types';
import { Provider } from './Provider';

export class S3 extends Provider implements IResourceCleaner {
  protected s3: AWS.S3;
  protected buckets: string[];

  public constructor(options: IS3Options) {
    super('S3', options);

    this.buckets = options.buckets || [];
    this.s3 = options.s3 || new AWS.S3({
      region: options && options.region ? options.region : undefined,
    });
  }

  public getData(): any {
    return this.buckets;
  }

  public async list(): Promise<boolean> {
    console.log('[S3] Listing Buckets');

    this.emit('listStarted', { resource: this, region: this.region });

    try {
      const response = await this.s3.listBuckets().promise();

      if (!response || !response.Buckets) {
        return false;
      }

      this.buckets = response && response.Buckets ? response.Buckets.map((bucket: AWS.S3.Bucket) => bucket.Name as string) : [];

      this.emit('listCompleted', { resource: this, region: this.region, data: { buckets: this.buckets } });

      return true;
    } catch (error) {
      console.error(colors.red(error.message));

      return false;
    }
  }

  public async remove(): Promise<boolean> {
    console.log('[S3] Deleting Buckets');

    try {
      this.emit('deleteStarted', { resource: this, region: this.region, data: { buckets: this.buckets } });

      if (this.dryRun) {
        console.log('[S3] Dry Run');

        return true;
      }

      if (!this.buckets) {
        throw new Error('Bucket list has not been set');
      }

      await BPromise.map(this.buckets, async (bucket: string) => {
        try {
          let token: string | undefined;
          let versionMarker: string | undefined;
          let keyMarker: string | undefined;

          this.emit('deletionStarted', { region: this.region, name: bucket });

          do {
            const listResponse: AWS.S3.ListObjectsV2Output = await this.s3.listObjectsV2({
              Bucket: bucket,
              ContinuationToken: token,
            }).promise();

            // delete objects
            await BPromise.map(listResponse.Contents || [], async (obj) => {
              try {
                await this.s3.deleteObject({
                  Bucket: bucket,
                  Key: obj.Key,
                } as AWS.S3.DeleteObjectRequest).promise();
                process.stdout.write('.');
              } catch (error) {
                console.error(error.message);
              }
            });

            token = listResponse.NextContinuationToken;
          } while (token);

          do {
            const listVersionsResponse = await this.s3.listObjectVersions({
              Bucket: bucket,
              KeyMarker: keyMarker,
              VersionIdMarker: versionMarker,
            }).promise();

            // delete versions
            await BPromise.map(listVersionsResponse.Versions || [], async (obj) => {
              try {
                await this.s3.deleteObject({
                  Bucket: bucket,
                  Key: obj.Key,
                  VersionId: obj.VersionId,
                } as AWS.S3.DeleteObjectRequest).promise();
                process.stdout.write('.');
              } catch (error) {
                console.error(error.message);
              }
            }, { concurrency: 1000 });

            // delete delete markers
            await BPromise.map(listVersionsResponse.DeleteMarkers || [], async (obj) => {
              try {
                await this.s3.deleteObject({
                  Bucket: bucket,
                  Key: obj.Key,
                  VersionId: obj.VersionId,
                } as AWS.S3.DeleteObjectRequest).promise();
                process.stdout.write('.');
              } catch (error) {
                console.error(error.message);
              }
            }, { concurrency: 1000 });

            versionMarker = listVersionsResponse.NextVersionIdMarker;
            keyMarker = listVersionsResponse.KeyMarker;
          } while (versionMarker);

          try {
            // delete bucket
            await this.s3.deleteBucket({
              Bucket: bucket,
            }).promise();
            process.stdout.write('.');
          } catch (error) {
            console.error(colors.red('Delete bucket error'), bucket, error.message);
          }

          this.emit('deletionCompleted', { region: this.region, name: bucket });
        } catch (error) {
          console.error(colors.red(error.message));
        }
      }, { concurrency: 5 });

      this.emit('deleteCompleted', { resource: this, region: this.region, data: this.buckets });

      return true;
    } catch (error) {
      if (error.message === 'The specified bucket does not exist') {
        return true;
      }

      console.error(colors.red(error.message));

      return false;
    }
  }
}
