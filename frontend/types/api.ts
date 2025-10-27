export type ApiSuccess<T> = {
  status: "success";
  data: T;
};

export type ApiErrorResponse = {
  status: "error";
  error: {
    code: string;
    message: string;
    details?: string[];
  };
};

export type ApiClientError = {
  status: number;
  data: ApiErrorResponse | null;
};
