export class ApiError extends Error {
  status?: number;
  statusCode?: number;
  payload?: unknown;

  constructor(
    message: string,
    options?: {
      status?: number;
      statusCode?: number;
      payload?: unknown;
      cause?: unknown;
    }
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options?.status;
    this.statusCode = options?.statusCode ?? options?.status;
    this.payload = options?.payload;

    if ("cause" in Error.prototype) {
      (this as Error & { cause?: unknown }).cause = options?.cause;
    }
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
