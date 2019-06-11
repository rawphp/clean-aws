import { list } from '../list';

describe('list', () => {
  it('is a function', () => {
    expect(typeof list).toEqual('function');
  });

  // it('writes a resource file successfully', async () => {
  //   const profile = 'default';

  //   const resources = await list({
  //     profile,
  //     dryRun: false,
  //     region: 'ap-southeast-2',
  //     resourceFile: `${process.cwd()}/${profile}-resources.json`,
  //   });

  //   console.log('resources', resources);
  // });
});
