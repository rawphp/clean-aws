import * as BPromise from 'bluebird';
import * as colors from 'colors/safe';
import * as fs from 'fs-extra';
import * as Confirm from 'prompt-confirm';
import { loadResources } from './loadResources';
import { ICleanOptions, IMasterResourceList, IRegionResources, IResourceCleaner } from './types';

export const clean = async (options: ICleanOptions) => {
  let resources: IMasterResourceList;

  resources = await fs.readJson(options.resourceFile);

  if (!options.dryRun) {
    const prompt = new Confirm({
      name: 'Delete Resources',
      message: 'Are you sure you want to continue deleting? [Y/n]',
    });

    if (await prompt.run()) {
      await BPromise.map(Object.keys(resources), async (region: string) => {
        const opts: IRegionResources = resources[region];

        const resourceCleaners: IResourceCleaner[] = loadResources(opts);

        await BPromise.map(resourceCleaners, (resource: IResourceCleaner) => {
          return resource.remove(opts);
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
