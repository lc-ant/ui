import { LcAntHttpRequest } from './http-request';

export class LcAntHttpResponse<T> {
  constructor(
    public request: LcAntHttpRequest,
    public body: T | null,
    public headers: { [header: string]: string },
    public status: number,
    public statusText: string
  ) {}
}
