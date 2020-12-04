export interface PaginationConfig {
  current: number;
  size: number;
}

export interface PaginationResponse<T> extends PaginationConfig {
  items: T;
  total: number;
}
