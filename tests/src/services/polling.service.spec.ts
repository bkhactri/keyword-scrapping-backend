import * as userConnection from '@src/services/user-connection.service';
import * as keywordService from '@src/services/keyword.service';
import * as socketSetup from '@src/config/socket';
import * as pollingService from '@src/services/polling.service';
import { KeywordStatus } from '@src/enums/keyword.enum';

jest.mock('@src/config/socket', () => ({
  getIO: jest.fn(),
}));
jest.mock('@src/services/user-connection.service', () => ({
  getByUserId: jest.fn(),
}));
jest.mock('@src/services/keyword.service', () => ({
  getByKeywordId: jest.fn(),
}));

describe('Polling service', () => {
  const mockSocketId = 'mock-socket-id';
  const mockUserId = 'mock-user-id';
  const mockKeywordId = 1;
  const mockKeyword = {
    id: mockKeywordId,
    userId: mockUserId,
    keyword: 'key1',
    status: KeywordStatus.Pending,
  };

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

      await pollingService.emitKeywordUpdate(mockUserId, mockKeywordId);

      expect(mockIoTo.to).toHaveBeenCalled();
      expect(mockIoTo.to).toHaveBeenCalledWith(mockSocketId);
      expect(mockIoEmit.emit).toHaveBeenCalled();
      expect(mockIoEmit.emit).toHaveBeenCalledWith(
        'keyword-processed',
        mockKeyword,
      );
    });

    it('should return if not found user connection', async () => {
      (userConnection.getByUserId as jest.Mock).mockResolvedValue(null);

      await pollingService.emitKeywordUpdate(mockUserId, mockKeywordId);

      expect(mockIoTo.to).not.toHaveBeenCalled();
      expect(mockIoEmit.emit).not.toHaveBeenCalled();
      expect(keywordService.getByKeywordId).not.toHaveBeenCalled();
    });

    it('should return if  not found keyword', async () => {
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
