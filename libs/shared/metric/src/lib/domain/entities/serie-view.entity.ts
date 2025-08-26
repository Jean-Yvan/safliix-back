import { SerieViewToPrisma } from "@safliix-back/database";

export class SerieView {
  constructor(
    public readonly id: string | undefined,
    public readonly serieId: string,
    
    public readonly userId: string,
    public readonly viewedAt: Date = new Date(),

    public readonly seasonWatched = 0,
    public readonly totalTimeSpent = 0, 
    public readonly rating = 0,

    public readonly createdAt : Date | undefined,
    public readonly updatedAt: Date | undefined,

  ) {}

  /* static create(data :[] ){

  }

  static restore(data : SerieViewToPrisma) : SerieView {

  } */ 
  
}