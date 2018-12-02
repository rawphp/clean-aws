import { EventEmitter } from 'events';
import { ICleanOptions } from '../types';

export abstract class BaseResource extends EventEmitter {
  public region: string;
  public profile: string;
  public dryRun: boolean;
  protected name: string;

  public constructor(name: string, options: ICleanOptions) {
    super();

    this.name = name;
    this.region = options.region;
    this.profile = options.profile;
    this.dryRun = options.dryRun;
  }

  public toString() {
    return `${this.name}-${this.profile}-${this.region}`;
  }
}
