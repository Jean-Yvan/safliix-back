import { AutoMapper, NestedRelationMapper } from './mapper';


// --- Mocks pour nested relations ---
type Metadata = { id?: string; title: string };
type VideoFile = { id?: string; filePath: string };

// Nested mappers simulés
const metadataMapper: NestedRelationMapper<Metadata, any, any> = {
  toPrismaCreate: (data) => ({ title: data.title }),
  toPrismaUpdate: (data) => ({ title: data.title + '-updated' }),
};

const videoFileMapper: NestedRelationMapper<VideoFile, any, any> = {
  toPrismaCreate: (data) => ({ filePath: data.filePath }),
  toPrismaUpdate: (data) => ({ filePath: data.filePath + '-updated' }),
};

// --- Entité Movie mockée ---
type MovieAggregate = {
  id?: string;
  status: string;
  type: string;
  rentalPrice?: number | null;
  metadata: Metadata;
  videoFile: VideoFile;
};

// Mapper pour MovieAggregate
const movieMapper = new AutoMapper<MovieAggregate, any, any>({
  metadata: metadataMapper,
  videoFile: videoFileMapper,
});

// Exemple de MovieAggregate
const movie: MovieAggregate = {
  id: 'm1',
  status: 'available',
  type: 'movie',
  rentalPrice: 5,
  metadata: { id: 'md1', title: 'Inception' },
  videoFile: { id: 'vf1', filePath: '/videos/inception.mp4' },
};

describe('AutoMapper - MovieAggregate', () => {
  it('should map create correctly', () => {
    const result = movieMapper.toPrismaCreate(movie);
    expect(result).toEqual({
      id: 'm1',
      status: 'available',
      type: 'movie',
      rentalPrice: 5,
      metadata: { create: { title: 'Inception' } },
      videoFile: { create: { filePath: '/videos/inception.mp4' } },
    });
  });

  it('should map update correctly', () => {
    const result = movieMapper.toPrismaUpdate(movie);
    expect(result).toEqual({
      id: 'm1',
      status: 'available',
      type: 'movie',
      rentalPrice: 5,
      metadata: { update: { title: 'Inception-updated' } },
      videoFile: { update: { filePath: '/videos/inception.mp4-updated' } },
    });
  });

  it('should map upsert correctly for nested relations', () => {
    const result = movieMapper.toPrisma(movie, true, ['metadata', 'videoFile']);
    expect(result).toEqual({
      id: 'm1',
      status: 'available',
      type: 'movie',
      rentalPrice: 5,
      metadata: { upsert: { create: { title: 'Inception' }, update: { title: 'Inception-updated' } } },
      videoFile: { upsert: { create: { filePath: '/videos/inception.mp4' }, update: { filePath: '/videos/inception.mp4-updated' } } },
    });
  });

  it('should throw error if update without id', () => {
    expect(() => movieMapper.toPrismaUpdate({ ...movie, id: undefined })).toThrow(
      'id is required for update'
    );
  });
});
