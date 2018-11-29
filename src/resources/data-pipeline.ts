import * as AWS from 'aws-sdk';
import { ICleanOptions, IResourceCleaner } from '../types';

export interface IDataPipelineList {
  region: string;
  dataPipelines: string[];
}

const availability = ['us-west-2', 'eu-west-1', 'ap-southeast-2', 'ap-northeast-1'];

export class DataPipeline implements IResourceCleaner {
  protected dataPipeline: AWS.DataPipeline;
  protected region: string;

  public constructor(options: ICleanOptions) {
    this.region = options.region;

    this.dataPipeline = new AWS.DataPipeline({
      region: options && options.region ? options.region : '',
    });
  }

  public async list(): Promise<object> {
    console.log('[DataPipeline] Listing Stacks', this.region);

    try {
      const file: IDataPipelineList = {
        region: this.region,
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
    }
  }

  public async remove(pipelines: string[]): Promise<number> {
    try {
      const processes = pipelines.map((pipelineId: string) => {
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
