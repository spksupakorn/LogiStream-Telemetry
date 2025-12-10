export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ErrorResponse;
  meta?: MetaData;
  timestamp: string;
}

export interface ErrorResponse {
  code: string;
  message: string;
  details?: any;
  path?: string;
}

export interface MetaData {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export class ResponseBuilder {
  static success<T>(data: T, meta?: MetaData): ApiResponse<T> {
    return {
      success: true,
      data,
      meta,
      timestamp: new Date().toISOString()
    };
  }

  static created<T>(data: T): ApiResponse<T> {
    return {
      success: true,
      data,
      timestamp: new Date().toISOString()
    };
  }

  static noContent(): ApiResponse<null> {
    return {
      success: true,
      data: null,
      timestamp: new Date().toISOString()
    };
  }

  static error(code: string, message: string, details?: any, path?: string): ApiResponse {
    return {
      success: false,
      error: {
        code,
        message,
        details,
        path
      },
      timestamp: new Date().toISOString()
    };
  }

  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number
  ): ApiResponse<T[]> {
    return {
      success: true,
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      timestamp: new Date().toISOString()
    };
  }
}
