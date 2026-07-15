import { randomInt } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { PasswordGenerator } from '../../domain/ports/password-generator';

const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{}';
const ALL = LOWER + UPPER + DIGITS + SYMBOLS;

/**
 * Genera contraseñas temporales con el generador criptográficamente seguro de Node.
 *
 * El resultado siempre tiene 16 caracteres e incluye al menos una minúscula,
 * una mayúscula, un dígito y un símbolo antes de barajarse.
 */
@Injectable()
export class CryptoPasswordGenerator implements PasswordGenerator {
  /**
   * Devuelve una contraseña lista para hashearse y guardarse en usuarios creados
   * sin contraseña explícita.
   */
  generate(): string {
    return shuffle([
      pick(LOWER),
      pick(UPPER),
      pick(DIGITS),
      pick(SYMBOLS),
      ...Array.from({ length: 12 }, () => pick(ALL)),
    ]).join('');
  }
}

function pick(chars: string): string {
  return chars[randomInt(chars.length)];
}

function shuffle(chars: string[]): string[] {
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars;
}
