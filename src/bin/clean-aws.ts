#!/usr/bin/env node

import * as colors from 'colors/safe';
import * as program from 'commander';
import * as readPackageUp from 'read-pkg-up';
import * as semver from 'semver';

const { pkg } = readPackageUp.sync();

const version = pkg.version;
const logger = console;

if (semver.satisfies(version, pkg.engines.node)) {
  logger.error(colors.red(`Clean AWS requires Node ${pkg.engines.node}`));

  process.exit(1);
}

program
  .version(version)
  .command('list', 'list resources in an environment')
  .command('clean', 'initialise a new tracking solution')
  .parse(process.argv);
