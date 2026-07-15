import { Inject, Injectable } from '@nestjs/common';
import { Firestore } from 'firebase-admin/firestore';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/ports/user.repository';
import { UserMapper } from '../mappers/user.mapper';
import { FIRESTORE_DB } from './firebase.module';

@Injectable()
export class FirestoreUserRepository implements UserRepository {
  private readonly collection;

  constructor(@Inject(FIRESTORE_DB) private readonly db: Firestore) {
    this.collection = db.collection('users');
  }

  async create(user: User): Promise<User> {
    await this.collection.doc(user.id).set(UserMapper.toDocument(user));

    return user;
  }

  async findById(id: string): Promise<User | null> {
    const snapshot = await this.collection.doc(id).get();

    if (!snapshot.exists) {
      return null;
    }

    return UserMapper.toEntity(snapshot.id, snapshot.data());
  }

  async findByEmail(email: string): Promise<User | null> {
    const snapshot = await this.collection
      .where('email', '==', email)
      .limit(1)
      .get()
    const [doc] = snapshot.docs;

    return doc ? UserMapper.toEntity(doc.id, doc.data()) : null;
  }

  async findAll(page: number, limit: number): Promise<User[]> {
    const snapshot = await this.collection
      .orderBy('username')
      .offset((page - 1) * limit)
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => UserMapper.toEntity(doc.id, doc.data()));
  }

  async update(user: User): Promise<void> {
    await this.collection.doc(user.id).update({
      username: user.username,
      email: user.email,
    });
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await this.collection.doc(id).update({
      password: hashedPassword,
    });
  }

  async delete(id: string): Promise<void> {
    await this.collection.doc(id).delete();
  }
}
