import { logger } from '@src/config/logger';
import * as userConnection from '@src/services/user-connection.service';
import * as keywordService from '@src/services/keyword.service';
import * as reportService from '@src/services/report.service';
import * as socketSetup from '@src/config/socket';
import * as pollingService from '@src/services/polling.service';
import { mockSocketId } from '@tests/_mocks_/context-mock';
import { mockUserId } from '@tests/_mocks_/user-mock';
import {
  mockKeywordAttributes,
  mockKeywordDto,
  mockKeywordId,
  mockSearchResultAttributes,
} from '@tests/_mocks_/keyword-mock';

jest.mock('@src/config/socket', () => ({
  getIO: jest.fn(),
}));
jest.mock('@src/services/user-connection.service', () => ({
  getByUserId: jest.fn(),
}));
jest.mock('@src/services/keyword.service', () => ({
  getByKeywordId: jest.fn(),
}));
jest.mock('@src/services/report.service', () => ({
  getSearchResultByKeywordId: jest.fn(),
}));
jest.mock('@src/config/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('Polling service', () => {
  const mockIoEmit = {
    emit: jest.fn(),
  };

  const mockIoTo = {
    to: jest.fn().mockReturnValue(mockIoEmit),
  };

  beforeEach(() => {
    (socketSetup.getIO as jest.Mock).mockReturnValue(mockIoTo);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('emitKeywordUpdate', () => {
    it('should emit to correct socket with payload', async () => {
      // Arrange
      (userConnection.getByUserId as jest.Mock).mockResolvedValue({
        socketId: mockSocketId,
      });

      (keywordService.getByKeywordId as jest.Mock).mockResolvedValue(
        mockKeywordAttributes,
      );

      (reportService.getSearchResultByKeywordId as jest.Mock).mockResolvedValue(
        mockSearchResultAttributes,
      );

      // Act
      await pollingService.emitKeywordUpdate(mockUserId, mockKeywordId);

      // Assert
      expect(mockIoTo.to).toHaveBeenCalled();
      expect(mockIoTo.to).toHaveBeenCalledWith(mockSocketId);
      expect(mockIoEmit.emit).toHaveBeenCalled();
      expect(mockIoEmit.emit).toHaveBeenCalledWith(
        'keyword-processed',
        mockKeywordDto,
      );
    });

    it('should return if not found user connection', async () => {
      // Arrange
      (userConnection.getByUserId as jest.Mock).mockResolvedValue(null);

      // Act
      await pollingService.emitKeywordUpdate(mockUserId, mockKeywordId);

      // Assert
      expect(logger.warn).toHaveBeenCalledWith(
        { userId: mockUserId },
        'No active connection',
      );
      expect(mockIoTo.to).not.toHaveBeenCalled();
      expect(mockIoEmit.emit).not.toHaveBeenCalled();
      expect(keywordService.getByKeywordId).not.toHaveBeenCalled();
    });

    it('should return if not found keyword', async () => {
      // Arrange
      (userConnection.getByUserId as jest.Mock).mockResolvedValue({
        socketId: mockSocketId,
      });

      (keywordService.getByKeywordId as jest.Mock).mockResolvedValue(null);

      // Act
      await pollingService.emitKeywordUpdate(mockUserId, mockKeywordId);

      // Assert
      expect(logger.warn).toHaveBeenCalledWith(
        { keywordId: mockKeywordId },
        'Keyword with ID not found',
      );
      expect(mockIoTo.to).not.toHaveBeenCalled();
      expect(mockIoEmit.emit).not.toHaveBeenCalled();
    });

    it('should return if not found search result', async () => {
      // Arrange
      (userConnection.getByUserId as jest.Mock).mockResolvedValue({
        socketId: mockSocketId,
      });

      (keywordService.getByKeywordId as jest.Mock).mockResolvedValue(
        mockKeywordAttributes,
      );

      (reportService.getSearchResultByKeywordId as jest.Mock).mockResolvedValue(
        null,
      );

      // Act
      await pollingService.emitKeywordUpdate(mockUserId, mockKeywordId);

      // Assert
      expect(logger.warn).toHaveBeenCalledWith(
        { keywordId: mockKeywordAttributes.id },
        'Search result not found',
      );
      expect(mockIoTo.to).not.toHaveBeenCalled();
      expect(mockIoEmit.emit).not.toHaveBeenCalled();
    });

    it('should catch error if anything went wrong', async () => {
      // Arrange
      const mockError = new Error('Database error');

      (userConnection.getByUserId as jest.Mock).mockRejectedValue(mockError);

      // Act
      await pollingService.emitKeywordUpdate(mockUserId, mockKeywordId);

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        { userId: mockUserId, keywordId: mockKeywordId, error: mockError },
        'Emit scrapped keyword to user failed',
      );
      expect(mockIoTo.to).not.toHaveBeenCalled();
      expect(mockIoEmit.emit).not.toHaveBeenCalled();
    });
  });
});
