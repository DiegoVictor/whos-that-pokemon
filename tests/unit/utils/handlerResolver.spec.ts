import { handlerPath } from '@utils/handlerResolver';

describe('handlerResolver', () => {
  it('should be able to resolve path', async () => {
    expect(handlerPath(__dirname)).toBe('tests/unit/utils');
  });
});
