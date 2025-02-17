import * as csv from 'fast-csv';
import { BadRequestError } from '@src/utils/error.util';

const KEYWORD_COLUMN_HEADER = 'Keyword';

export const parseCSV = async (buffer: Buffer): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const keywords: string[] = [];

    const stream = csv
      .parse({ headers: true })
      .on('error', (error) => reject(error))
      .on('data', (row: Record<string, string>) => {
        if (row[KEYWORD_COLUMN_HEADER]) {
          keywords.push(row[KEYWORD_COLUMN_HEADER].trim());
        }
      })
      .on('end', () => resolve(keywords));

    stream.write(buffer);
    stream.end();
  });
};

export const validateKeywords = (keywords: string[]): void => {
  if (keywords.length < 1) {
    throw new BadRequestError(
      'No keywords found in the file. Please ensure your CSV file includes a list of keywords below the "Keyword" header',
    );
  }

  if (keywords.length > 100) {
    throw new BadRequestError(
      'Looks like you have a lot of keywords! Please keep your file to a maximum of 100 keywords',
    );
  }
};
