import * as userConnection from '@src/services/user-connection.service';
import * as keywordService from '@src/services/keyword.service';
import * as reportService from '@src/services/report.service';
import * as socketSetup from '@src/config/socket';
import * as pollingService from '@src/services/polling.service';
import {
  mockKeyword,
  mockKeywordId,
  mockSearchResult,
  mockSocketId,
  mockUserId,
} from '@tests/_mocks_/context-mock';
import { KeywordDto } from '@src/dtos/keyword.dto';

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
      (userConnection.getByUserId as jest.Mock).mockResolvedValue({
        socketId: mockSocketId,
      });

      (keywordService.getByKeywordId as jest.Mock).mockResolvedValue(
        mockKeyword,
      );

      (reportService.getSearchResultByKeywordId as jest.Mock).mockResolvedValue(
        mockSearchResult,
      );

      await pollingService.emitKeywordUpdate(mockUserId, mockKeywordId);

      expect(mockIoTo.to).toHaveBeenCalled();
      expect(mockIoTo.to).toHaveBeenCalledWith(mockSocketId);
      expect(mockIoEmit.emit).toHaveBeenCalled();
      expect(mockIoEmit.emit).toHaveBeenCalledWith(
        'keyword-processed',
        new KeywordDto({
          ...mockKeyword,
          searchResult: mockSearchResult,
        }),
      );
    });

    it('should return if not found user connection', async () => {
      (userConnection.getByUserId as jest.Mock).mockResolvedValue(null);

      await pollingService.emitKeywordUpdate(mockUserId, mockKeywordId);

      expect(mockIoTo.to).not.toHaveBeenCalled();
      expect(mockIoEmit.emit).not.toHaveBeenCalled();
      expect(keywordService.getByKeywordId).not.toHaveBeenCalled();
    });

    it('should return if not found keyword', async () => {
      (userConnection.getByUserId as jest.Mock).mockResolvedValue({
        socketId: mockSocketId,
      });

      (keywordService.getByKeywordId as jest.Mock).mockResolvedValue(null);

      await pollingService.emitKeywordUpdate(mockUserId, mockKeywordId);

      expect(mockIoTo.to).not.toHaveBeenCalled();
      expect(mockIoEmit.emit).not.toHaveBeenCalled();
    });
  });
});
