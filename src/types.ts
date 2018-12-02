import { EventEmitter } from 'events';

export interface IResourceCleaner extends EventEmitter {
  list: () => Promise<object>;
  remove: (list: IRegionResources) => Promise<number>;
  toString: () => string;
}

export interface ICleanOptions {
  profile: string;
  region: string;
  resourceFile: string;
  dryRun: boolean;
  [key: string]: any;
}

// document types

export type ValidRegion = 'ap-southeast-2' | 'eu-west-1';

export interface IMasterResourceList {
  'us-east-1'?: IRegionResources;
  'us-east-2'?: IRegionResources;
  'us-west-1'?: IRegionResources;
  'us-west-2'?: IRegionResources;

  'ap-south-1'?: IRegionResources;

  'ap-northeast-1'?: IRegionResources;
  'ap-northeast-2'?: IRegionResources;
  'ap-northeast-3'?: IRegionResources;
  'ap-southeast-1'?: IRegionResources;
  'ap-southeast-2'?: IRegionResources;
  'ca-central-1'?: IRegionResources;
  'cn-north-1'?: IRegionResources;
  'cn-northwest-1'?: IRegionResources;

  'eu-central-1'?: IRegionResources;
  'eu-west-1'?: IRegionResources;
  'eu-west-2'?: IRegionResources;
  'eu-west-3'?: IRegionResources;

  'sa-east-1'?: IRegionResources;
  'us-gov-east-1'?: IRegionResources;
  'us-gov-west-1'?: IRegionResources;
}

export type IRegionResources =
  & ISQSList
  & ISNSList
  & IBucketsList
  & IIAMList
  & IEC2List
  & IDynamoDbTableList
  & IDataPipelineList
  & ICloudWatchList
  & ICloudFormationList;

export interface ISQSList {
  region: string;
  profile: string;
  queues: string[];
}

export interface ISNSList {
  region: string;
  profile: string;
  topics: string[];
  subscriptions: string[];
}

export interface IBucketsList {
  region: string;
  profile: string;
  buckets: string[];
}

export interface IIAMList {
  region: string;
  profile: string;
  policies: string[];
  roles: string[];
  accessKeys: string[];
  users: string[];
}

export interface IEC2List {
  region: string;
  profile: string;
  ec2s: string[];
}

export interface IDynamoDbTableList {
  region: string;
  profile: string;
  tables: string[];
}

export interface IDataPipelineList {
  region: string;
  profile: string;
  dataPipelines: string[];
}

export interface ICloudWatchList {
  region: string;
  profile: string;
  logGroups: string[];
}

export interface ICloudFormationList {
  region: string;
  profile: string;
  cloudFormationStacks: string[];
}
