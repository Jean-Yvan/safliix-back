// Temporary query definitions for front auth flows
export class GetMeQuery {
  constructor(
    public readonly userId?: string,
    public readonly email?: string,
    public readonly roles?: string[]
  ) {}
}
