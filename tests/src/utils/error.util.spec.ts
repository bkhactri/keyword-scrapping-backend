import { HttpStatus } from '@src/enums/http-status.enum';
import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  InternalServerError,
} from '@src/utils/error.util';

describe('Error util', () => {
  describe('AppError', () => {
    it('should create an AppError with correct data', () => {
      const message = 'Test error message';
      const isOperational = true;
      const details = { extra: 'info' };

      const error = new AppError(
        message,
        HttpStatus.BadRequest,
        isOperational,
        details,
      );

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(HttpStatus.BadRequest);
      expect(error.isOperational).toBe(isOperational);
      expect(error.details).toEqual(details);
    });

    it('should create an AppError without details', () => {
      const message = 'Test error message without details';
      const isOperational = false;

      const error = new AppError(
        message,
        HttpStatus.InternalServerError,
        isOperational,
      );

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(HttpStatus.InternalServerError);
      expect(error.isOperational).toBe(isOperational);
      expect(error.details).toBeUndefined();
    });
  });

  describe('BadRequestError', () => {
    it('should create a BadRequestError with correct data', () => {
      const message = 'Bad request';
      const details = { field: 'email', message: 'is invalid' };
      const error = new BadRequestError(message, details);

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(HttpStatus.BadRequest);
      expect(error.isOperational).toBe(true);
      expect(error.details).toEqual(details);
    });
  });

  describe('UnauthorizedError', () => {
    it('should create a UnauthorizedError with correct data', () => {
      const message = 'Unauthorized';
      const details = { message: 'Invalid token' };
      const error = new UnauthorizedError(message, details);

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(HttpStatus.Unauthorized);
      expect(error.isOperational).toBe(true);
      expect(error.details).toEqual(details);
    });
  });

  describe('NotFoundError', () => {
    it('should create a NotFoundError with correct data', () => {
      const message = 'Not found';
      const details = { id: 1 };
      const error = new NotFoundError(message, details);

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(HttpStatus.NotFound);
      expect(error.isOperational).toBe(true);
      expect(error.details).toEqual(details);
    });
  });

  describe('InternalServerError', () => {
    it('should create an InternalServerError with default message', () => {
      const error = new InternalServerError();

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe('Internal Server Error');
      expect(error.statusCode).toBe(HttpStatus.InternalServerError);
      expect(error.isOperational).toBe(false);
      expect(error.details).toBeUndefined();
    });

    it('should create an InternalServerError with custom message and details', () => {
      const message = 'Custom internal server error';
      const details = { reason: 'database connection failed' };
      const error = new InternalServerError(message, details);

      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(HttpStatus.InternalServerError);
      expect(error.isOperational).toBe(false);
      expect(error.details).toEqual(details);
    });
  });
});
