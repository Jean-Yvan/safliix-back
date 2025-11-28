export class GetPlaybackQuery {
  constructor(
    public readonly id: string,
    public readonly type: 'film' | 'serie' | 'episode' | 'ad',
    public readonly attachmentType?: 'MAIN' | 'TRAILER' | 'BONUS' | 'CLIP' | 'ADVERTISEMENT'
  ) {}
}
