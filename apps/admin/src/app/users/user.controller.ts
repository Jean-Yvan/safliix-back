import { Body, Controller, Post,Put,Get,Query, Param, ParseUUIDPipe } from '@nestjs/common';
import { 
  CreateUserHandler,
  UpdateUserHandler,
  ListUserByIdHandler,
  ListUserHandler,
  CreateUserCommand,
  UpdateUserCommand,
  ListUserByIdQuery,
  ListUserQuery,
  CreateUserDto,
  UpdateUserDto,
  ListUserDto,
} from '@safliix-back/users';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
//import { CreateUserDto } from '@safliix-back/users';

@Controller('users')
export class AdminUserController{

  constructor(
    private readonly createHandler:CreateUserHandler,
    private readonly updateHandler:UpdateUserHandler,
    private readonly listByIdHandler: ListUserByIdHandler,
    private readonly listHandler: ListUserHandler
  ){}


  @Post()
  @ApiOperation({summary:"Create a new user"})
  @ApiResponse({
    status:201,
    description:"User created succesfully"
  })
  @ApiResponse({ 
    status: 400,
    description: 'Invalid input data'
  })
  async create(@Body() dto:CreateUserDto){
    const command = new CreateUserCommand(dto);

    const result = await this.createHandler.execute(command);

    if(result.isErr()){
      throw result.unwrapErr();
    }

    return {
      success:true,
      data: result.unwrap()
    };

  }

  @Put()
  @ApiOperation({summary:"Update a user"})
  @ApiResponse({
    status:201,
    description:"User updated succesfully"
  })
  @ApiResponse({ 
    status: 400,
    description: 'Invalid input data'
  })
  async update(@Body() dto:UpdateUserDto){
    const command = new UpdateUserCommand(dto);

    const result = await this.updateHandler.execute(command);

    if(result.isErr()){
      throw result.unwrapErr();
    }

    return {
      success:true,
      data: result.unwrap()
    };

  }

  @Get()
  @ApiOperation({ summary: 'List users with filters' })
  async list(@Query() filters: ListUserDto) {
    const query = new ListUserQuery(filters);
    const result = await this.listHandler.execute(query);

    if (result.isErr()) {
      throw result.unwrapErr();
    }

    return {
      success: true,
      data: result.unwrap(),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'List user by id' })
  async listById(@Param('id') id:string){
    const query = new ListUserByIdQuery(id);
    const result = await this.listByIdHandler.execute(query);

    if (result.isErr()) {
      throw result.unwrapErr();
    }

    return {
      success: true,
      data: result.unwrap(),
    };
  }

}