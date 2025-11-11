export class ActiveSubscriptionNotFoundError extends Error {
  constructor(userId: string) {
    super(`No active subscription found for user ${userId}`);
    this.name = ActiveSubscriptionNotFoundError.name;
  }
}
