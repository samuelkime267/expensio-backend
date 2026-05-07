export interface CustomError extends Error {
  statusCode?: number;
  errors?: { field: string; message: string }[];
}
