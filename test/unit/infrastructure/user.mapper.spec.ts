import { User } from '../../../src/domain/entities/user.entity';
import { UserMapper } from '../../../src/infrastructure/mappers/user.mapper';

describe('mapper de usuarios', () => {
  it('mapea una entidad a un documento de Firestore', () => {
    const user = User.create({
      id: 'user-1',
      username: 'Ada',
      email: 'ada@example.com',
      password: 'hashed',
    });

    expect(UserMapper.toDocument(user)).toEqual({
      username: 'Ada',
      email: 'ada@example.com',
      password: 'hashed',
    });
  });

  it('guarda el password faltante como null y lo restaura como undefined', () => {
    const user = User.create({
      id: 'user-1',
      username: 'Ada',
      email: 'ada@example.com',
    });
    const document = UserMapper.toDocument(user);
    const entity = UserMapper.toEntity('user-1', document);

    expect(document.password).toBeNull();
    expect(entity).toEqual(user);
    expect(entity.password).toBeUndefined();
  });
});
