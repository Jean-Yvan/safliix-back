
export class Subscription{
  private constructor(
    public readonly id:string | undefined,
    public readonly userId: string,
    public readonly planId: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly renewalStatus: string,
    public readonly country: string,

    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ){}

  
}