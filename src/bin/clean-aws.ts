#!/usr/bin/env node

import * as colors from 'colors/safe';
import * as program from 'commander';
import * as semver from 'semver';

const requiredVersion = '>=8.10';
const logger = console;

if (!semver.satisfies(process.version, requiredVersion)) {
  logger.error(colors.red(`Clean AWS requires Node ${requiredVersion}`));

  process.exit(1);
}

program
  .command('list', 'list resources in an environment')
  .command('clean', 'clean aws environment')
  .parse(process.argv);
