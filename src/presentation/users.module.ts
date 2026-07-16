import { Module } from '@nestjs/common';
import { AssignGeneratedPasswordUseCase } from '../application/use-cases/assign-generated-password.use-case';
import { CreateUserUseCase } from '../application/use-cases/create-user.use-case';
import { DeleteUserUseCase } from '../application/use-cases/delete-user.use-case';
import { GetUserUseCase } from '../application/use-cases/get-user.use-case';
import { ListUsersUseCase } from '../application/use-cases/list-users.use-case';
import { UpdateUserUseCase } from '../application/use-cases/update-user.use-case';
import {
  EVENT_PUBLISHER,
  EventPublisher,
} from '../domain/ports/event-publisher';
import {
  PASSWORD_GENERATOR,
  PasswordGenerator,
} from '../domain/ports/password-generator';
import { PASSWORD_HASHER, PasswordHasher } from '../domain/ports/password-hasher';
import { USER_REPOSITORY, UserRepository } from '../domain/ports/user.repository';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { UserController } from './controllers/user.controller';
import { UserCreatedListener } from './listeners/user-created.listener';

@Module({
  imports: [InfrastructureModule],
  controllers: [UserController],
  providers: [
    {
      provide: CreateUserUseCase,
      inject: [USER_REPOSITORY, PASSWORD_HASHER, EVENT_PUBLISHER],
      useFactory: (
        users: UserRepository,
        hasher: PasswordHasher,
        events: EventPublisher,
      ) => new CreateUserUseCase(users, hasher, events),
    },
    {
      provide: AssignGeneratedPasswordUseCase,
      inject: [USER_REPOSITORY, PASSWORD_GENERATOR, PASSWORD_HASHER],
      useFactory: (
        users: UserRepository,
        generator: PasswordGenerator,
        hasher: PasswordHasher,
      ) => new AssignGeneratedPasswordUseCase(users, generator, hasher),
    },
    {
      provide: GetUserUseCase,
      inject: [USER_REPOSITORY],
      useFactory: (users: UserRepository) => new GetUserUseCase(users),
    },
    {
      provide: ListUsersUseCase,
      inject: [USER_REPOSITORY],
      useFactory: (users: UserRepository) => new ListUsersUseCase(users),
    },
    {
      provide: UpdateUserUseCase,
      inject: [USER_REPOSITORY],
      useFactory: (users: UserRepository) => new UpdateUserUseCase(users),
    },
    {
      provide: DeleteUserUseCase,
      inject: [USER_REPOSITORY],
      useFactory: (users: UserRepository) => new DeleteUserUseCase(users),
    },
    UserCreatedListener,
  ],
})
export class UsersModule {}
