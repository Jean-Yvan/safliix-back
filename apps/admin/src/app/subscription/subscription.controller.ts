import { Controller, Body, Post,Put, Param, Get, Delete } from "@nestjs/common";

import {
  CreateSubscriptionPlanHandler,
  UpdateSubscriptionPlanHandler,
  DeleteSubscriptionPlanHandler,
  ListSubscriptionPlanByIdHandler,
  ListSubscriptionPlansHandler,
  ListSubscriptionPlanByNameHandler,

  CreateSubscriptionPlanCommand,
  UpdateSubscriptionPlanCommand,
  DeleteSubscriptionPlanCommand,
  ListSubscriptionPlanQuery,
  ListSubscriptionPlanByIdQuery,
  ListSubscriptionPlanByNameQuery,

  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,

} from '@safliix-back/access';

import { ApiOperation,ApiResponse } from "@nestjs/swagger";

@Controller("subscription")
export class AdminSubscriptionController{

  constructor(
    private readonly createHandler : CreateSubscriptionPlanHandler,
    private readonly updateHandler : UpdateSubscriptionPlanHandler,
    private readonly deleteHandler : DeleteSubscriptionPlanHandler,
    private readonly listHandler : ListSubscriptionPlansHandler,
    private readonly listByIdHandler : ListSubscriptionPlanByIdHandler,
    private readonly listByNameHandler : ListSubscriptionPlanByNameHandler
  ){}

  @Post()
  @ApiOperation({summary:"create a new subscription plan"})
  @ApiResponse({ 
    status: 201,
    description: 'Plan created successfully'
  })
  @ApiResponse({ 
    status: 400,
    description: 'Invalid input data'
  })
  async create(@Body() dto: CreateSubscriptionPlanDto) {
    const command = new CreateSubscriptionPlanCommand(dto);

    const result = await this.createHandler.execute(command);
    if(result.isErr()){
      throw result.isErr();
    }else{
      return {
        success:true,
        data: result.unwrap()
      };
    }
  }

  @Put()
  @ApiOperation({summary:"update a subscription plan"})
  @ApiResponse({ 
    status: 201,
    description: 'Plan updated successfully'
  })
  @ApiResponse({ 
    status: 400,
    description: 'Invalid input data'
  })
  async update(@Body() dto: UpdateSubscriptionPlanDto) {
    const command = new UpdateSubscriptionPlanCommand(dto);

    const result = await this.updateHandler.execute(command);
    if(result.isErr()){
      throw result.isErr();
    }else{
      return {
        success:true,
        data: result.unwrap()
      };
    }
  }

  @Delete()
  @ApiOperation({summary:"delete a subscription plan"})
  @ApiResponse({ 
    status: 201,
    description: 'Plan deleted successfully'
  })
  @ApiResponse({ 
    status: 400,
    description: 'Invalid input data'
  })
  async delete(@Param() id:string) {
    const command = new DeleteSubscriptionPlanCommand(id);

    const result = await this.deleteHandler.execute(command);
    if(result.isErr()){
      throw result.isErr();
    }else{
      return {
        success:true,
        data: result.unwrap()
      };
    }
  }

  @Get()
  @ApiOperation({summary:"list all subscription plan"})
  @ApiResponse({ 
    status: 201,
    description: 'list successfully'
  })
  @ApiResponse({ 
    status: 400,
    description: 'Invalid input data'
  })
  async list() {
    const command = new ListSubscriptionPlanQuery();

    const result = await this.listHandler.execute(command);
    if(result.isErr()){
      throw result.isErr();
    }else{
      return {
        success:true,
        data: result.unwrap()
      };
    }
  }

  @Get(':id')
  @ApiOperation({summary:"list subscription plan by id"})
  @ApiResponse({ 
    status: 201,
    description: 'list successfully'
  })
  @ApiResponse({ 
    status: 400,
    description: 'Invalid input data'
  })
  async listById(@Param() id:string ) {
    const command = new ListSubscriptionPlanByIdQuery(id);

    const result = await this.listByIdHandler.execute(command);
    if(result.isErr()){
      throw result.isErr();
    }else{
      return {
        success:true,
        data: result.unwrap()
      };
    }
  }

}