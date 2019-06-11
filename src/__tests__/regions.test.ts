import { regions } from '../regions';

describe('regions', () => {
  it('returns a list of regions correctly', () => {
    expect(regions).toMatchSnapshot();
  });
});
