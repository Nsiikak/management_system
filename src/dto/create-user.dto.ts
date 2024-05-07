/* eslint-disable prettier/prettier */
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { userRole } from 'enum/role.enum';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @MinLength(8, { message: 'sorry, you must put in 8 characters' })
  @MaxLength(16, { message: 'Password should not be more than 16 charaters' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  role: userRole;
}
