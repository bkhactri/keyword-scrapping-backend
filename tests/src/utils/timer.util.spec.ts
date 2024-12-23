import { randomDelay } from '@src/utils/timer.util';

describe('Timer util', () => {
  describe('randomDelay', () => {
    it('should resolve after a random delay between 1 minute and 2 minutes', async () => {
      const randomRange = 1;

      const startTime = Date.now();
      await randomDelay(randomRange);
      const endTime = Date.now();

      const elapsedTime = endTime - startTime;
      expect(elapsedTime).toBeGreaterThanOrEqual(1000);
      expect(elapsedTime).toBeLessThanOrEqual(3000);
    }, 2000);

    it('should resolve after a random delay between 1 minute and 3 minutes', async () => {
      const randomRange = 2;

      const startTime = Date.now();
      await randomDelay(randomRange);
      const endTime = Date.now();

      const elapsedTime = endTime - startTime;
      expect(elapsedTime).toBeGreaterThanOrEqual(1000);
      expect(elapsedTime).toBeLessThanOrEqual(3000);
    }, 3000);
  });
});
