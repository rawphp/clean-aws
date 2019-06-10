import * as BPromise from 'bluebird';
import * as colors from 'colors/safe';
import * as fs from 'fs-extra';
import * as Confirm from 'prompt-confirm';
import { loadProviders } from './loadProviders';
import { IMasterResourceList, IProviderOptions, IRegionResources, IResourceCleaner } from './types';

export const clean = async (options: IProviderOptions) => {
  let resources: IMasterResourceList = {};

  if (options.resourceFile && fs.existsSync(options.resourceFile)) {
    resources = await fs.readJson(options.resourceFile);
  } else {
    resources = {};
  }

  if (!options.dryRun) {
    const prompt = new Confirm({
      name: 'Delete Resources',
      message: 'Are you sure you want to continue deleting? [Y/n]',
    });

    if (await prompt.run()) {
      await BPromise.map(Object.keys(resources), async (region: string) => {
        const opts: IRegionResources = resources[region];

        opts.region = region;

        const resourceCleaners: IResourceCleaner[] = loadProviders(opts);

        await BPromise.map(resourceCleaners, (resource: IResourceCleaner) => {
          resource.on('deletionStarted', (data) => {
            console.log(`Deleting ${data.name} started`);
          });

          resource.on('deletionCompleted', (data) => {
            console.log(`Deleting ${data.name} completed`);
          });

          return resource.remove();
        });
      });
    } else {
      return 2;
    }
  } else {
    console.log(colors.green(JSON.stringify(resources, null, 2)));
  }

  return 0;
};
