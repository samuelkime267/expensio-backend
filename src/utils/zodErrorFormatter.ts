import { ZodError } from "zod";

export function zodErrorFormatter(err: ZodError): {
  field: string;
  message: string;
}[] {
  return err.issues.map((issue) => ({
    field: issue.path.length ? issue.path.join(".") : "root",
    message: issue.message,
  }));
}
