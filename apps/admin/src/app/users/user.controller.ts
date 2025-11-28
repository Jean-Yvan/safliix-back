import { Body, Controller, Post,Put,Get,Query, Param, Patch } from '@nestjs/common';
import { 
  CreateUserHandler,
  UpdateUserHandler,
  ListUserByIdHandler,
  CreateUserCommand,
  UpdateUserCommand,
  ListUserByIdQuery,
  CreateUserDto,
  UpdateUserDto,
} from '@safliix-back/users';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '@safliix-back/database';
import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

class UserListQueryDto {
  @Type(() => Number)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsOptional()
  pageSize?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  role?: string;
}

@Controller('users')
export class AdminUserController{

  constructor(
    private readonly createHandler:CreateUserHandler,
    private readonly updateHandler:UpdateUserHandler,
    private readonly listByIdHandler: ListUserByIdHandler,
    private readonly prisma: PrismaService
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
  async list(@Query() filters: UserListQueryDto) {
    const page = Math.max(1, filters.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? 10));
    const where: Record<string, unknown> = {};
    if (filters.search) {
      where.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { name: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [totalItems, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return {
      success: true,
      data: {
        items: users,
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

  @Patch(':id')
  @ApiOperation({ summary: 'Update user status/role/profile' })
  async patchUser(
    @Param('id') id: string,
    @Body() body: { status?: string; role?: string; profile?: Record<string, unknown> },
  ) {
    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        isVerified: body.status ? body.status === 'active' : undefined,
        name: body.profile?.['name'] as string | undefined,
      },
    });
    return { success: true, data: updated };
  }
}
