import { Controller, Body, Post,Put, Param, Get, Delete, Query } from "@nestjs/common";

import {
  CreateSubscriptionPlanHandler,
  UpdateSubscriptionPlanHandler,
  DeleteSubscriptionPlanHandler,
  ListSubscriptionPlanByIdHandler,

  CreateSubscriptionPlanCommand,
  UpdateSubscriptionPlanCommand,
  DeleteSubscriptionPlanCommand,
  ListSubscriptionPlanByIdQuery,

  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,

} from '@safliix-back/access';

import { ApiOperation,ApiResponse } from "@nestjs/swagger";
import { Prisma, PrismaService } from "@safliix-back/database";
import { Type } from "class-transformer";
import { IsOptional, IsString } from "class-validator";

class PlanListQueryDto {
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsOptional()
  pageSize?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;
}

@Controller(["subscription","plans"])
export class AdminSubscriptionController{
  constructor(
    private readonly createHandler : CreateSubscriptionPlanHandler,
    private readonly updateHandler : UpdateSubscriptionPlanHandler,
    private readonly deleteHandler : DeleteSubscriptionPlanHandler,
    private readonly listByIdHandler : ListSubscriptionPlanByIdHandler,
    private readonly prisma: PrismaService
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

  @Put(':id')
  @ApiOperation({summary:"update a subscription plan"})
  @ApiResponse({ 
    status: 201,
    description: 'Plan updated successfully'
  })
  @ApiResponse({ 
    status: 400,
    description: 'Invalid input data'
  })
  async update(@Param('id') id: string, @Body() dto: UpdateSubscriptionPlanDto) {
    const command = new UpdateSubscriptionPlanCommand({ ...dto, id });

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

  @Delete(':id')
  @ApiOperation({summary:"delete a subscription plan"})
  @ApiResponse({ 
    status: 201,
    description: 'Plan deleted successfully'
  })
  @ApiResponse({ 
    status: 400,
    description: 'Invalid input data'
  })
  async delete(@Param('id') id:string) {
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
  async list(@Query() query: PlanListQueryDto) {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize ?? 10));
    const where = query.search
      ? {
          name: { contains: query.search, mode: 'insensitive' as Prisma.QueryMode },
        }
      : undefined;

    const [totalItems, plans] = await Promise.all([
      this.prisma.subscriptionPlan.count({ where }),
      this.prisma.subscriptionPlan.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      success: true,
      data: {
        items: plans,
        pageInfo: {
          page,
          pageSize,
          totalItems,
          totalPages: Math.ceil(totalItems / pageSize),
        },
      },
    };
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
  async listById(@Param('id') id:string ) {
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
