#!/usr/bin/env node

import * as colors from 'colors/safe';
import * as program from 'commander';
import * as semver from 'semver';

const version = '8.10.0';
const logger = console;

if (semver.satisfies(process.version, version)) {
  logger.error(colors.red(`Clean AWS requires Node ${version}`));

  process.exit(1);
}

program
  .version(version)
  .command('list', 'list resources in an environment')
  .command('clean', 'initialise a new tracking solution')
  .parse(process.argv);
