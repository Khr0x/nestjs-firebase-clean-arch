import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EVENT_PUBLISHER } from '../domain/ports/event-publisher';
import { PASSWORD_GENERATOR } from '../domain/ports/password-generator';
import { PASSWORD_HASHER } from '../domain/ports/password-hasher';
import { USER_REPOSITORY } from '../domain/ports/user.repository';
import { NestEventPublisher } from './events/nest-event.publisher';
import { FirebaseModule } from './firebase/firebase.module';
import { FirestoreUserRepository } from './firebase/firestore-user.repository';
import { BcryptPasswordHasher } from './security/bcrypt-password.hasher';
import { CryptoPasswordGenerator } from './security/crypto-password.generator';

@Module({
  imports: [ConfigModule, FirebaseModule],
  providers: [
    { provide: USER_REPOSITORY, useClass: FirestoreUserRepository },
    { provide: PASSWORD_GENERATOR, useClass: CryptoPasswordGenerator },
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    { provide: EVENT_PUBLISHER, useClass: NestEventPublisher },
  ],
  exports: [
    USER_REPOSITORY,
    PASSWORD_GENERATOR,
    PASSWORD_HASHER,
    EVENT_PUBLISHER,
  ],
})
export class InfrastructureModule {}
