import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import firebaseConfig from './config/firebase.config';
import securityConfig from './config/security.config';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { UsersModule } from './presentation/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [firebaseConfig, securityConfig],
    }),
    EventEmitterModule.forRoot(),
    InfrastructureModule,
    UsersModule,
  ],
})
export class AppModule {}
