export interface PaginationInput {
  page?: unknown;
  limit?: unknown;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ParsedPagination {
  page: number;
  limit: number;
  skip: number;
}

export function parsePagination(
  input: PaginationInput,
  defaults: { page?: number; limit?: number; maxLimit?: number } = {}
): ParsedPagination {
  const defaultPage = defaults.page ?? 1;
  const defaultLimit = defaults.limit ?? 20;
  const maxLimit = defaults.maxLimit ?? 50;

  const page = Math.max(defaultPage, Number(input.page) || defaultPage);
  const limit = Math.min(maxLimit, Math.max(1, Number(input.limit) || defaultLimit));

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

export function buildPaginationMeta(input: ParsedPagination, total: number): PaginationMeta {
  return {
    page: input.page,
    limit: input.limit,
    total,
    pages: Math.max(1, Math.ceil(total / input.limit)),
  };
}
