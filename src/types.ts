export interface IResourceCleaner {
  list: () => Promise<object>;
  remove: (stacks: string[]) => Promise<number>;
}

export interface ICleanOptions {
  profile?: string;
  region: string;
  outputFile?: string;
  [key: string]: any;
}
