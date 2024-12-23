import { enqueueKeywordProcessing } from '@src/services/queue.service';
import { keywordQueue } from '@src/config/queue';
import { mockKeywordProcessingPayload } from '@tests/_mocks_/keyword-mock';

jest.mock('@src/config/queue', () => ({
  keywordQueue: {
    add: jest.fn(),
  },
}));

describe('enqueueKeywordProcessing', () => {
  it('should add a job to the keyword queue with the correct payload', () => {
    // Act
    enqueueKeywordProcessing(mockKeywordProcessingPayload);

    // Assert
    expect(keywordQueue.add).toHaveBeenCalledWith(
      'process-keyword',
      mockKeywordProcessingPayload,
    );
  });
});
