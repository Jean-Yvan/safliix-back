import { Body, Controller, Post,Get,Param } from '@nestjs/common';
import { CreateMovieHandler,CreateMovieDto,CreateMovieMapper,DeleteMovieHandler,UpdateMovieHandler,GetMoviesHandler } from '@safliix-back/movies';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('admin/movies')
export class AdminMovieController {
  constructor(
    private readonly createMovieHandler: CreateMovieHandler,
    private readonly deleteMovieHandler: DeleteMovieHandler,
    private readonly updateMovieHandler: UpdateMovieHandler,
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
    const commandResult = await CreateMovieMapper.toDomain(dto);
    if(commandResult.isErr()) {
      throw commandResult.unwrapErr();
    }else{
      const result = await this.createMovieHandler.execute(commandResult.unwrap());
      if(result.isErr()){
        throw result.unwrapErr();
      }else{
        return {
          success : true,
          data : result.unwrap
        }
      }
    
    }
    

    
  }

  /* @Get()
  async list() {
    return this.queryBus.execute(new ListMoviesQuery());
  }

  @Get(':id')
  async getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.queryBus.execute(new GetMovieQuery(id));
  } */

}