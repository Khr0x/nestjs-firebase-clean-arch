export const PASSWORD_GENERATOR = Symbol('PASSWORD_GENERATOR');

export interface PasswordGenerator {
  generate(): string;
}
