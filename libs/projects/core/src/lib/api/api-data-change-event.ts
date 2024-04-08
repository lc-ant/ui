export enum ApiDataChangeEventType {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED'
}

export interface ApiDataChangeEvent {

  dataType: string;
  eventType: ApiDataChangeEventType;
  tenantId?: string;
  dataId: string;
  dataVersion: number;
  data: any;

}
