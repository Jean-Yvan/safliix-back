import { AutoMapper, NestedRelationMapper } from "./mappers.js";


// 👇 Mock local des types Prisma
type CreateToPrisma<T> = Omit<T, 'id'> & { id?: string };
type UpdateToPrisma<T> = Omit<T, 'id'> & { id: string };

type MetadataAggregate = {
  id?: string;
  title: string;
  description: string;
};

type MovieAggregate = {
  id?: string;
  title: string;
  status: string;
  metadata: MetadataAggregate;
};

// NestedRelationMapper pour Metadata
const metadataNestedMapper: NestedRelationMapper<
  MetadataAggregate,
  CreateToPrisma<MetadataAggregate>,
  UpdateToPrisma<MetadataAggregate>
> = {
  toPrismaCreate: (m) => ({
    title: m.title,
    description: m.description
  }),
  toPrismaUpdate: (m) => ({
    id: m.id!,
    title: m.title,
    description: m.description
  })
};

// Mapper principal
const movieMapper = new AutoMapper<
  MovieAggregate,
  CreateToPrisma<MovieAggregate>,
  UpdateToPrisma<MovieAggregate>,
  { metadata: typeof metadataNestedMapper }
>({
  metadata: metadataNestedMapper
});



describe("MovieMapper", () => {
  const movie = {
    id: "m1",
    title: "Inception",
    status: "AVAILABLE",
    metadata: {
      id: "md1",
      title: "Meta",
      description: "Description"
    }
  };

  it("maps create correctly", () => {
    const createInput = movieMapper.toPrismaCreate(movie);
    console.log(JSON.stringify(createInput, null, 2));
    expect(createInput).toEqual({
      title: "Inception",
      status: "AVAILABLE",
      metadata: {
        create: {
          title: "Meta",
          description: "Description"
        }
      }
    });
  });

  it("maps update correctly", () => {
    const updateInput = movieMapper.toPrismaUpdate(movie);
    expect(updateInput).toEqual({
      id: "m1",
      title: "Inception",
      status: "AVAILABLE",
      metadata: {
        update: {
          id: "md1",
          title: "Meta",
          description: "Description"
        }
      }
    });
  });
});
