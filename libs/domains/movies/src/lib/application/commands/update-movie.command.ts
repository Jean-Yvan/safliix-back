export class UpdateMovieCommand {
  constructor(
    public readonly movieId: string,
    public readonly payload: {
      title?: string;
      status?: 'DRAFT' | 'PUBLISHED';
      // ... autres champs modifiables
    }
  ) {}
}