import { HttpException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'entity/user.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
  ) {}

  async create(payload: CreateProductDto, user: User) {
    // const product = await this.productRepo.create(payload);
    // return this.productRepo.save(product);
    const product = new Product();
    product.userId = user.id;
    Object.assign(product, payload);
    return await this.productRepo.save(product);
  }

  async findAllProducts() {
    return await this.productRepo.find();
  }

  async findOne(id: string) {
    return await this.findProduct(id);
  }

  async update(id: string, payload: UpdateProductDto) {
    await this.findProduct(id);
    return await this.productRepo.update(id, payload);
  }

  async remove(id: string) {
    const product = await this.productRepo.findOneBy({ id });
    if (!product) {
      throw new HttpException(`${id} not found`, 401);
    }
    return await this.productRepo.delete({ id });
  }
  async findProduct(id: string) {
    const find = await this.productRepo.findOne({ where: { id: id } });
    if (!find) {
      throw new HttpException(`Sorry product with id: ${id} not found `, 401);
    }
    return find;
  }
}
