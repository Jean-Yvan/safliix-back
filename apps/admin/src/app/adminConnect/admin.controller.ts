import { Body, Controller, Post,Put,Get,Query, Param, ParseUUIDPipe } from '@nestjs/common';
import { 
  CreateAdminHandler,
  UpdateAdminHandler,
  ListAdminByIdHandler,
  ListAdminHandler,
  CreateAdminCommand,
  UpdateAdminCommand,
  ListAdminByIdQuery,
  ListAdminByEmailQuery,
  ListAdminByEmailHandler,
  ListAdminQuery,
  CreateAdminDto,
  UpdateAdminDto,
  AdminFilterDto,
  DeleteAdminHandler,
} from '@safliix-back/adminEntity';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller("adminUser")
export class AdminController{
  constructor(
    private readonly createHandler: CreateAdminHandler,
    private readonly updateHandler: UpdateAdminHandler,
    private readonly deleteHandler: DeleteAdminHandler,
    private readonly listHandler: ListAdminHandler,
    private readonly listByIdHandler: ListAdminByIdHandler,
    private readonly listByEmailHandler: ListAdminByEmailHandler
  ){}

  @Post()
    @ApiOperation({summary:"Create a new admin"})
    @ApiResponse({
      status:201,
      description:"Admin created succesfully"
    })
    @ApiResponse({ 
      status: 400,
      description: 'Invalid input data'
    })
    async create(@Body() dto:CreateAdminDto){
      const command = new CreateAdminCommand(dto);
  
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
    @ApiOperation({summary:"Update an admin"})
    @ApiResponse({
      status:201,
      description:"Admin updated succesfully"
    })
    @ApiResponse({ 
      status: 400,
      description: 'Invalid input data'
    })
    async update(@Body() dto:UpdateAdminDto){
      const command = new UpdateAdminCommand(dto);
  
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
    @ApiOperation({ summary: 'List admins with filters' })
    async list(@Query() filters: AdminFilterDto) {
      const query = new ListAdminQuery(filters);
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
    @ApiOperation({ summary: 'List admin by id' })
    async listById(@Param('id') id:string){
      const query = new ListAdminByIdQuery(id);
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
