import { CustomError } from "@/types";
import { Model, PopulateOptions } from "mongoose";

interface PaginationOptions<T> {
  model: Model<T>;
  filter?: Record<string, any>;
  page?: number;
  count?: number;
  sort?: Record<string, 1 | -1>;
  populate?: PopulateOptions | (string | PopulateOptions)[];
  select?: string;
}

interface PaginationResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    prevPage: number | null;
    nextPage: number | null;
    maxPage: number;
    count: number;
    totalItems: number;
  };
}

export async function paginate<T>({
  model,
  filter = {},
  page = 1,
  count = 20,
  sort,
  populate,
  select,
}: PaginationOptions<T>): Promise<PaginationResult<T>> {
  const currentPage = Math.max(1, page);

  const itemCount = Math.min(100, Math.max(1, count));

  const totalItems = await model.countDocuments(filter);

  const maxPage = Math.ceil(totalItems / itemCount);

  if (currentPage > maxPage && totalItems > 0) {
    const error = new Error("Page not found.") as CustomError;
    error.statusCode = 404;
    throw error;
  }

  const skip = (currentPage - 1) * itemCount;

  let query = model.find(filter);

  if (select) {
    query = query.select(select);
  }

  if (sort) {
    query = query.sort(sort);
  }

  if (populate) {
    query = query.populate(populate);
  }

  const data = await query.skip(skip).limit(itemCount);

  return {
    data,
    pagination: {
      currentPage,
      prevPage: currentPage > 1 ? currentPage - 1 : null,
      nextPage: currentPage < maxPage ? currentPage + 1 : null,
      maxPage,
      count: itemCount,
      totalItems,
    },
  };
}
