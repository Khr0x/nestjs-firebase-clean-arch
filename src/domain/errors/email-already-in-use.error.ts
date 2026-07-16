export class EmailAlreadyInUseError extends Error {
  constructor(email: string) {
    super(`El email ya está en uso: ${email}`);
    this.name = 'EmailAlreadyInUseError';
  }
}
