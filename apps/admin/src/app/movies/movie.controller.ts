import { Body, Controller, Post } from '@nestjs/common';
import { CreateMovieHandler,CreateMovieDto,CreateMovieMapper } from '@safliix-back/movies';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('admin/movies')
export class AdminMovieController {
  constructor(
    private readonly createMovieHandler: CreateMovieHandler,
    private readonly createMovieMapper: CreateMovieMapper
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
    const commandResult = await this.createMovieMapper.toDomain(dto);
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
}