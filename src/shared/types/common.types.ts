export type ApiResponse<T = any> = {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
};

export type PaginationOptions = {
  page: number;
  limit: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
