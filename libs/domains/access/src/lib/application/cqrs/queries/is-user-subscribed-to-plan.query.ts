export class IsUserSubscribedToPlanQuery {
  constructor(
    public readonly userId: string,
    public readonly planId: string
  ) {}
}
