import * as BPromise from 'bluebird';
import * as colors from 'colors/safe';
import * as fs from 'fs-extra';
import { loadResources } from './loadResources';
import { ICleanOptions, IMasterResourceList, IResourceCleaner } from './types';

export const list = async (options: ICleanOptions) => {
  const resourceCleaners: IResourceCleaner[] = loadResources(options);

  const resources: any = {};

  console.log('Registering Resource Cleaners');

  resourceCleaners.forEach((resource: IResourceCleaner) => {
    resource.on('listStarted', (data) => {
      resources[data.resource.toString()] = data;
    });
    resource.on('listCompleted', (data) => {
      console.log(colors.green(`Completed ${data.resource.toString()}`));

      delete resources[data.resource.toString()];
    });
  });

  const interval = setInterval(() => {
    console.log('resources remaining: ', colors.italic(colors.grey(Object.keys(resources).toString())));
  }, 3000);

  const allFiles: IMasterResourceList = {};

  const resourceMaps = await BPromise.map(
    resourceCleaners,
    async (resource: IResourceCleaner) => {
      try {
        return resource.list();
      } catch (error) {
        console.error(`[${resource.toString()}] error:`, error.message);

        return Promise.resolve({
          region: options.region,
        });
      }
    },
    { concurrency: 30 },
  );

  resourceMaps.forEach((file: any) => {
    if (!file || !file.region) {
      return;
    }

    if (!allFiles[file.region]) {
      allFiles[file.region] = {
        ...file,
      };
    } else {
      allFiles[file.region] = {
        ...allFiles[file.region],
        ...file,
      };
    }
  });

  clearInterval(interval);

  console.log(`Writing resources to ${options.resourceFile}`);

  await fs.writeJson(`${options.resourceFile}`, allFiles, { spaces: 2 });

  return 0;
};
