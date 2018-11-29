#!/usr/bin/env node

import * as program from 'commander';
import { list } from '../list';
import { regions } from '../regions';

program
  .description('list resources in AWS account')
  .option('-p, --profile [profile]', 'AWS profile')
  .option('-r, --region [region]', 'AWS region')
  .option('-o, --output [output]', 'output path, defaults to `resources.json`')
  .parse(process.argv);

if (program.region && program.region.indexOf(',') > -1) {
  program.region = program.region.split(',');
}

// tslint:disable:no-floating-promises
(async () => {
  try {
    const statusCode = await list({
      profile: program.profile,
      region: program.region || regions,
      outputFile: program.output || `${process.cwd()}/resources.json`,
    });

    if (statusCode === 0) {
      console.log('Listing operation completed successfully');
    } else {
      console.error(`Resource listing failed with exit code "${statusCode}"`);
    }

    process.exitCode = statusCode;
  } catch (error) {
    console.error({ error: error.message });
    process.exitCode = 1;
  }
})();
