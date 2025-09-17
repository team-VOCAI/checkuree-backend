import { ApiResponse } from '../shared/types/common.types';

export class ResponseUtil {
  static success<T>(data?: T, message = 'Success'): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static error(message = 'Error', error?: string): ApiResponse {
    return {
      success: false,
      message,
      error,
      timestamp: new Date().toISOString(),
    };
  }
}
