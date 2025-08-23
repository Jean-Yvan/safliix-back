import { Body, Controller, Post,Get,Query } from '@nestjs/common';
import { 
  CreateMovieHandler,
  CreateMovieDto,
  MovieFilterDto,  
  DeleteMovieHandler,
  GetMoviesHandler,
  CreateMovieCommand, 
  GetMoviesQuery
   } from '@safliix-back/movies';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('admin/movies')
export class AdminMovieController {
  constructor(
    private readonly createMovieHandler: CreateMovieHandler,
    private readonly deleteMovieHandler: DeleteMovieHandler,
    //private readonly updateMovieHandler: UpdateMovieHandler,
    private readonly getMoviesHandler: GetMoviesHandler, 
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new movie' })
  @ApiResponse({ 
    status: 201,
    description: 'Movie created successfully'
  })
  @ApiResponse({ 
    status: 400,
    description: 'Invalid input data'
  })
  async create(@Body() dto: CreateMovieDto) {
    const command = new CreateMovieCommand(dto);
    
    
      const result = await this.createMovieHandler.execute(command);
      if(result.isErr()){
        throw result.unwrapErr();
      }else{
        return {
          success : true,
          data : result.unwrap
        }
      }
    
    }
    

  @Get()
  @ApiOperation({ summary: 'List movies with filters' })
  async list(@Query() filters: MovieFilterDto) {
    const query = new GetMoviesQuery(filters);
    const result = await this.getMoviesHandler.execute(query);

    if (result.isErr()) {
      throw result.unwrapErr();
    }

    return {
      success: true,
      data: result.unwrap(),
    };
  }

  /* @Get(':id')
  async getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.queryBus.execute(new GetMovieQuery(id));
  } */ 

}