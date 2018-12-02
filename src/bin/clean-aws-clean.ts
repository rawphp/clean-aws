#!/usr/bin/env node

import * as AWS from 'aws-sdk';
import * as colors from 'colors/safe';
import * as program from 'commander';
import { clean } from '../clean';
import { regions } from '../regions';

program
  .description('remove resources in AWS account')
  .option('-p, --profile [profile]', 'AWS profile')
  .option('-t, --dryRun [dryRun]', 'display list of resources that would be deleted', false)
  .option('-d, --resourceFile [resourceFile]', 'output path, defaults to `$PROFILE-resources.json`')
  .parse(process.argv);

if (program.region && program.region.indexOf(',') > -1) {
  program.region = program.region.split(',');
}

if (program.profile) {
  const creds = new AWS.SharedIniFileCredentials({ profile: program.profile });

  AWS.config.credentials = creds;
} else {
  program.profile = process.env.AWS_PROFILE;
}

if (!program.profile) {
  throw new Error('Unable to find AWS profile');
}

// tslint:disable:no-floating-promises
(async () => {
  try {
    let statusCode = await clean({
      profile: program.profile,
      region: program.region || regions,
      resourceFile: program.resourceFile,
      dryRun: program.dryRun,
    });

    if (statusCode === 0) {
      console.log(colors.green('\nRemoving resources operation completed successfully\n'));
    } else if (statusCode === 2) {
      console.log(colors.yellow('\nRemoving resources cancelled\n'));

      statusCode = 0;
    } else {
      console.error(colors.red(`\nResource removal failed with exit code "${statusCode}"\n`));
    }

    process.exitCode = statusCode;
  } catch (error) {
    console.error(colors.red(error.message));
    process.exitCode = 1;
  }
})();
