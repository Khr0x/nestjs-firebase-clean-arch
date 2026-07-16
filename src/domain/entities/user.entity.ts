import { InvalidUserDataError } from '../errors/invalid-user-data.error';

type CreateUserProps = {
  id: string;
  username: string;
  email: string;
  password?: string;
  createdAt?: string;
  updatedAt?: string;
};

export class User {
  private constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly email: string,
    public readonly password?: string,
    public readonly createdAt: string = new Date().toISOString(),
    public readonly updatedAt: string = createdAt,
  ) {}

  static create(props: CreateUserProps): User {
    const now = new Date().toISOString();
    const id = props.id.trim();
    const username = props.username.trim();
    const email = props.email.trim().toLowerCase();
    const password = props.password?.trim();
    const createdAt = props.createdAt ?? now;
    const updatedAt = props.updatedAt ?? createdAt;

    if (!id) {
      throw new InvalidUserDataError('El id del usuario es obligatorio');
    }

    if (!username) {
      throw new InvalidUserDataError('El nombre de usuario es obligatorio');
    }

    if (!email) {
      throw new InvalidUserDataError('El email es obligatorio');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new InvalidUserDataError('El email no tiene un formato válido');
    }

    if (props.password !== undefined && !password) {
      throw new InvalidUserDataError('La contraseña no puede estar vacía');
    }

    if (Number.isNaN(Date.parse(createdAt))) {
      throw new InvalidUserDataError('La fecha de creación no es válida');
    }

    if (Number.isNaN(Date.parse(updatedAt))) {
      throw new InvalidUserDataError('La fecha de actualización no es válida');
    }

    return new User(id, username, email, password, createdAt, updatedAt);
  }

  hasPassword(): boolean {
    return Boolean(this.password);
  }
}
