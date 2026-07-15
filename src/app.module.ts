import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import firebaseConfig from './config/firebase.config';
import securityConfig from './config/security.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [firebaseConfig, securityConfig],
    }),
    EventEmitterModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
