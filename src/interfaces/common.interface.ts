export interface Pagination {
  page: number;
  pageSize: number;
}

export interface Filter {
  search: string | null | undefined;
}
