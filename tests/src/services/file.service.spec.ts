import { AppError } from '@src/utils/error.util';
import { parseCSV, validateKeywords } from '@src/services/file.service';
import { expectException } from '@tests/helpers/expect-exception.helper';

describe('File service', () => {
  describe('parseCSV', () => {
    it('should parse CSV buffer and return keywords', async () => {
      // Arrange
      const mockBuffer = Buffer.from('Keyword\nkeyword1\nkeyword2\nkeyword3');
      const expectedKeywords = ['keyword1', 'keyword2', 'keyword3'];

      // Act
      const result = await parseCSV(mockBuffer);

      // Assert
      expect(result).toEqual(expectedKeywords);
    });

    it('should handle empty CSV buffer', async () => {
      // Arrange
      const mockBuffer = Buffer.from('Keyword\n');
      const expectedKeywords: string[] = [];

      // Act
      const result = await parseCSV(mockBuffer);

      // Assert
      expect(result).toEqual(expectedKeywords);
    });

    it('should handle CSV with missing header', async () => {
      // Arrange
      const mockBuffer = Buffer.from('OtherHeader\nvalue1\nvalue2');
      const expectedKeywords: string[] = [];

      // Act
      const result = await parseCSV(mockBuffer);

      // Assert
      expect(result).toEqual(expectedKeywords);
    });

    it('should handle CSV with extra columns', async () => {
      // Arrange
      const mockBuffer = Buffer.from(
        'Keyword,ExtraColumn\nkeyword1,extraValue1\nkeyword2,extraValue2',
      );
      const expectedKeywords = ['keyword1', 'keyword2'];

      // Act
      const result = await parseCSV(mockBuffer);

      // Assert
      expect(result).toEqual(expectedKeywords);
    });

    it('should handle CSV with empty lines', async () => {
      // Arrange
      const mockBuffer = Buffer.from('Keyword\n\nkeyword1\n\nkeyword2\n');
      const expectedKeywords = ['keyword1', 'keyword2'];

      // Act
      const result = await parseCSV(mockBuffer);

      // Assert
      expect(result).toEqual(expectedKeywords);
    });

    it('should handle CSV with whitespace around keywords', async () => {
      // Arrange
      const mockBuffer = Buffer.from('Keyword\n keyword1 \n\tkeyword2\t\n');
      const expectedKeywords = ['keyword1', 'keyword2'];

      // Act
      const result = await parseCSV(mockBuffer);

      // Assert
      expect(result).toEqual(expectedKeywords);
    });
  });

  describe('validateKeywords', () => {
    it('should throw AppError if no keywords are provided', async () => {
      // Arrange
      const keywords: string[] = [];

      // Act + Assert
      await expectException({
        fn: () => validateKeywords(keywords),
        exceptionInstance: AppError,
        message:
          'No keywords found in the file. Please ensure your CSV file includes a list of keywords below the "Keyword" header',
      });
    });

    it('should throw AppError if more than 100 keywords are provided', async () => {
      // Arrange
      const keywords: string[] = Array(101).fill('keyword');

      // Act + Assert
      await expectException({
        fn: () => validateKeywords(keywords),
        exceptionInstance: AppError,
        message:
          'Looks like you have a lot of keywords! Please keep your file to a maximum of 100 keywords',
      });
    });

    it('should not throw an error if keywords are within the valid range', () => {
      // Case 1 - 99
      // Arrange
      const keywords: string[] = ['keyword1', 'keyword2'];

      // Act + Assert
      expect(() => validateKeywords(keywords)).not.toThrow();

      // Case 100
      // Arrange
      const hundredKeywords: string[] = Array(100).fill('keyword');

      // Act + Assert
      expect(() => validateKeywords(hundredKeywords)).not.toThrow();
    });
  });
});
