import { InvalidUserDataError } from '../errors/invalid-user-data.error';

type CreateUserProps = {
  id: string;
  username: string;
  email: string;
  password?: string;
};

export class User {
  private constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly email: string,
    public readonly password?: string,
  ) {}

  static create(props: CreateUserProps): User {
    const id = props.id.trim();
    const username = props.username.trim();
    const email = props.email.trim();
    const password = props.password?.trim();

    if (!id) {
      throw new InvalidUserDataError('User id is required');
    }

    if (!username) {
      throw new InvalidUserDataError('Username is required');
    }

    if (!email) {
      throw new InvalidUserDataError('Email is required');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new InvalidUserDataError('Email is invalid');
    }

    if (props.password !== undefined && !password) {
      throw new InvalidUserDataError('Password cannot be empty');
    }

    return new User(id, username, email, password);
  }

  hasPassword(): boolean {
    return Boolean(this.password);
  }
}
