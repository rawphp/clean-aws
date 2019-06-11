import * as BPromise from 'bluebird';
import * as colors from 'colors/safe';
import * as fs from 'fs-extra';
import { loadProviders } from './loadProviders';
import { IMasterResourceList, IProviderOptions, IResourceCleaner } from './types';

export const list = async (options: IProviderOptions): Promise<any> => {
  const cleaners: IResourceCleaner[] = loadProviders(options);

  const resources: any = {};
  const resourceList: IMasterResourceList = {};

  console.log('Registering Providers');

  cleaners.forEach((resource: IResourceCleaner) => {
    resource.on('listStarted', (data) => {
      resources[data.resource.toString()] = data;
    });
    resource.on('listCompleted', (event) => {
      console.log(colors.green(`Completed ${event.resource.toString()}`));

      if (!event || !event.region) {
        return;
      }

      if (!resourceList[event.region]) {
        resourceList[event.region] = {
          ...event.data,
        };
      } else {
        resourceList[event.region] = {
          ...resourceList[event.region],
          ...event.data,
        };
      }

      delete resources[event.resource.toString()];
    });
  });

  const interval = setInterval(() => {
    console.log('Resources remaining: ', colors.italic(colors.grey(Object.keys(resources).toString())));
  }, 3000);

  await BPromise.map(cleaners, async (resource: IResourceCleaner) => {
    try {
      return resource.list();
    } catch (error) {
      console.error(`[${resource.toString()}] error:`, error.message);

      return Promise.resolve({
        region: options.region,
      });
    }
  }, { concurrency: 20 });

  clearInterval(interval);

  console.log(`Writing resources to ${options.resourceFile}`);

  await fs.writeJson(`${options.resourceFile}`, resourceList, { spaces: 2 });

  return resourceList;
};
