import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getApps, initializeApp } from 'firebase-admin/app';
import { Firestore, getFirestore } from 'firebase-admin/firestore';

export const FIRESTORE_DB = Symbol('FIRESTORE_DB');

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: FIRESTORE_DB,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Firestore => {
        if (!getApps().length) {
          initializeApp({
            projectId: config.get<string>('firebase.projectId'),
          });
        }

        return getFirestore();
      },
    },
  ],
  exports: [FIRESTORE_DB],
})
export class FirebaseModule {}
