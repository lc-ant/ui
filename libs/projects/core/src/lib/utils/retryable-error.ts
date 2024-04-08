import { ApiError } from '../http/api-error';

export interface RetryableError {

  error: ApiError;
  retry(): void;

}
