#!/usr/bin/env node

import * as AWS from 'aws-sdk';
import * as colors from 'colors/safe';
import * as program from 'commander';
import { list } from '../list';
import { regions } from '../regions';

program
  .description('list resources in AWS account')
  .option('-p, --profile [profile]', 'AWS profile')
  .option('-r, --region [region]', 'AWS region')
  .option('-o, --resourceFile [resourceFile]', 'resource file path, defaults to `$PROFILE-resources.json`')
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
    const statusCode = await list({
      profile: program.profile,
      region: program.region || regions,
      dryRun: false,
      resourceFile: program.resourceFile || `${process.cwd()}/${program.profile}-resources.json`,
    });

    if (statusCode === 0) {
      console.log(colors.green('\nListing operation completed successfully\n'));
    } else {
      console.error(colors.red(`\nResource listing failed with exit code "${statusCode}"\n`));
    }

    process.exitCode = statusCode;

    return 0;
  } catch (error) {
    console.error(colors.red(error.message));
    process.exitCode = 1;

    return 1;
  }
})();
