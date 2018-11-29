#!/usr/bin/env node

import * as program from 'commander';
import { remove } from '../remove';

program
  .description('remove resources in AWS account')
  .option('-p, --profile [profile]', 'AWS profile')
  .option('-a, --all [all]', 'remove all resources')
  .option('-d, --dataFile [dataFile]', 'output path, defaults to `resources.json`')
  .parse(process.argv);

// tslint:disable:no-floating-promises
(async () => {
  try {
    const statusCode = await remove({
      profile: program.profile,
      dataFile: program.dataFile,
    });

    if (statusCode === 0) {
      console.log('Removing resources operation completed successfully');
    } else {
      console.error(`Resource removal failed with exit code "${statusCode}"`);
    }

    process.exitCode = statusCode;
  } catch (error) {
    console.error({ error: error.message });
    process.exitCode = 1;
  }
})();
