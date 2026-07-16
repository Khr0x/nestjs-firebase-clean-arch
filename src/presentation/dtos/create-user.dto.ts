import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()\-_=+[\]{}]).{8,}$/;

export class CreateUserDto {
  @IsString({ message: 'El nombre de usuario debe ser texto' })
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  @MaxLength(50, {
    message: 'El nombre de usuario no puede tener más de 50 caracteres',
  })
  username!: string;

  @IsEmail({}, { message: 'El email debe tener un formato válido' })
  @MaxLength(254, { message: 'El email no puede tener más de 254 caracteres' })
  email!: string;

  @IsOptional()
  @IsString({ message: 'La contraseña debe ser texto' })
  @MaxLength(128, { message: 'La contraseña no puede tener más de 128 caracteres' })
  @Matches(PASSWORD_PATTERN, {
    message:
      'La contraseña debe tener al menos 8 caracteres, una minúscula, una mayúscula y un símbolo',
  })
  password?: string;
}
