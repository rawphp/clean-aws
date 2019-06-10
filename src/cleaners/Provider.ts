import { EventEmitter } from 'events';
import { IProviderOptions } from '../types';

export abstract class Provider extends EventEmitter {
  public region: string;
  public profile: string;
  public dryRun: boolean;
  protected name: string;

  public constructor(name: string, options: IProviderOptions) {
    super();

    this.name = name;
    this.region = options.region;
    this.profile = options.profile;
    this.dryRun = options.dryRun || false;
  }

  public toString() {
    return `${this.name}-${this.profile}-${this.region}`;
  }
}
