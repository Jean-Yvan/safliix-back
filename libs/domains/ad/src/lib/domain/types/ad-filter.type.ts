export interface AdFilter {
  activeOnly?: boolean;
  includeExpired?: boolean;
  startsAfter?: Date;
  startsBefore?: Date;
  endsAfter?: Date;
  endsBefore?: Date;
  search?: string;
  attachmentId?: string;
  limit?: number;
  offset?: number;
}
