import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'El nombre de usuario debe ser texto' })
  @IsNotEmpty({ message: 'El nombre de usuario no puede estar vacío' })
  @MaxLength(50, {
    message: 'El nombre de usuario no puede tener más de 50 caracteres',
  })
  username?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  @MaxLength(254, { message: 'El email no puede tener más de 254 caracteres' })
  email?: string;
}
