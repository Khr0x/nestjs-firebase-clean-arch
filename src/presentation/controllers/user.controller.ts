import {
  Body,
  Controller,
  Delete,
  BadRequestException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { DeleteUserUseCase } from '../../application/use-cases/delete-user.use-case';
import { GetUserUseCase } from '../../application/use-cases/get-user.use-case';
import { ListUsersUseCase } from '../../application/use-cases/list-users.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.use-case';
import { CreateUserDto } from '../dtos/create-user.dto';
import { ListUsersQueryDto } from '../dtos/list-users-query.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserResponseDto } from '../dtos/user-response.dto';

const uuidPipe = new ParseUUIDPipe({
  exceptionFactory: () => new BadRequestException('El id debe ser un UUID válido'),
});

@Controller('users')
export class UserController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly listUsers: ListUsersUseCase,
    private readonly getUser: GetUserUseCase,
    private readonly updateUser: UpdateUserUseCase,
    private readonly deleteUser: DeleteUserUseCase,
  ) {}

  @Post()
  async create(@Body() body: CreateUserDto): Promise<UserResponseDto> {
    return UserResponseDto.from(await this.createUser.execute(body));
  }

  @Get()
  async list(
    @Query() query: ListUsersQueryDto,
  ): Promise<{ data: UserResponseDto[] }> {
    const users = await this.listUsers.execute(query.page, query.limit);

    return { data: users.map((user) => UserResponseDto.from(user)) };
  }

  @Get(':id')
  async get(@Param('id', uuidPipe) id: string): Promise<UserResponseDto> {
    return UserResponseDto.from(await this.getUser.execute(id));
  }

  @Patch(':id')
  async update(
    @Param('id', uuidPipe) id: string,
    @Body() body: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return UserResponseDto.from(await this.updateUser.execute(id, body));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', uuidPipe) id: string): Promise<void> {
    await this.deleteUser.execute(id);
  }
}
