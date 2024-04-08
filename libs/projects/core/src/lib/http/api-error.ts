import { LcAntHttpResponse } from './http-response';

export class ApiError {

  constructor(
    public httpCode: number,
    public errorCode: string,
    public errorMessage: string,
    public correlationId: string
  ) {}

  public static fromHttpResponse(r: LcAntHttpResponse<any>): ApiError {
    if (r.body?.httpCode) return new ApiError(r.body.httpCode, r.body.errorCode, r.body.errorMessage, r.body.correlationId);
    return new ApiError(r.status, '', '', '');
  }

}
