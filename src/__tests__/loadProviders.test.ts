import * as nock from 'nock';
import { loadProviders } from '../loadProviders';

describe('loadProviders', () => {
  const defaultOptions = {
    profile: 'test',
    region: 'ap-southeast-2',
  };

  beforeEach(() => {
    nock.disableNetConnect();
    delete process.env.AWS_PROFILE;
  });

  afterEach(() => {
    nock.enableNetConnect();
  });

  it('loads cleaners successfully', () => {
    const response = loadProviders(defaultOptions);

    expect(response).toMatchSnapshot();
  });

  it('loads cleaners successfully for multiple regions', () => {
    const response = loadProviders({
      ...defaultOptions,
      region: ['ap-southeast-2', 'eu-west-1'],
    });

    expect(response).toMatchSnapshot();
  });
});
