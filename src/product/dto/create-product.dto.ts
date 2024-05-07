import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsString()
  @IsNotEmpty()
  description: string;
  @IsString()
  @IsNotEmpty()
  brand: string;
  @IsNumber()
  @IsNotEmpty()
  price: number;
  @IsBoolean()
  isEmpty: boolean;
}
