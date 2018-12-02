import * as AWS from 'aws-sdk';
import { ICleanOptions, IDataPipelineList, IResourceCleaner } from '../types';
import { BaseResource } from './BaseResource';

const availability = ['us-west-2', 'eu-west-1', 'ap-southeast-2', 'ap-northeast-1'];

export class DataPipeline extends BaseResource implements IResourceCleaner {
  protected dataPipeline: AWS.DataPipeline;

  public constructor(options: ICleanOptions) {
    super('DataPipeline', options);

    this.dataPipeline =
      options.dataPipeline ||
      new AWS.DataPipeline({
        region: options && options.region ? options.region : '',
      });
  }

  public async list(): Promise<object> {
    console.log('[DataPipeline] Listing Stacks', this.region);

    this.emit('listStarted', { resource: this, region: this.region });

    try {
      const file: IDataPipelineList = {
        region: this.region,
        profile: this.profile,
        dataPipelines: [],
      };

      if (!availability.includes(this.region)) {
        return file;
      }

      const pipelines = await this.dataPipeline.listPipelines().promise();

      if (pipelines && pipelines.pipelineIdList) {
        pipelines.pipelineIdList.forEach((pipeline: AWS.DataPipeline.PipelineIdName) => {
          file.dataPipelines.push(pipeline.id as string);
        });
      }

      return file;
    } catch (error) {
      console.error(error);

      throw error;
    } finally {
      this.emit('listCompleted', { resource: this, region: this.region });
    }
  }

  public async remove({ dataPipelines }: { dataPipelines: string[] }): Promise<number> {
    try {
      const processes = dataPipelines.map((pipelineId: string) => {
        return this.dataPipeline
          .deletePipeline({
            pipelineId,
          })
          .promise();
      });

      await Promise.all(processes);

      return 0;
    } catch (error) {
      console.error(error);

      return 1;
    }
  }
}
