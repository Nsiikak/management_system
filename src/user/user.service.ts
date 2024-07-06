/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'entity/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dto/login.dto';
import { Request, Response } from 'express';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(payload: CreateUserDto) {
    payload.email = payload.email.toLowerCase();
    const { email, password, ...rest } = payload;
    const isUser = await this.userRepo.findOne({ where: { email } });
    if (isUser) {
      throw new HttpException('User with this email already exists', 400);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const user = await this.userRepo.save({
        email,
        password: hashedPassword,
        ...rest,
      });
      delete user.password;
      return user;
    } catch (error) {
      if (error.code === '22P02') {
        throw new BadRequestException('admin role should be lowercase');
      }
      return error;
    }
  }
  async login(
    payload: LoginDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<any> {
    payload.email = payload.email.toLowerCase();
    const { email, password } = payload;
    // const user = await this.userRepo.findOne({ where: { email } });
    const user = await this.userRepo
      .createQueryBuilder('user')
      .addSelect('User.password')
      .where('user.email = :email', { email: payload.email })
      .getOne();
    if (!user) {
      throw new HttpException('Invalid credentials', 404);
    }
    const isMatch = await bcrypt.compare(password, user.password);
    // password was hashed(in signup) so we use bcrypt compare method to compare
    if (!isMatch) {
      throw new HttpException('Invalid credentials', 400);
    }
    const token = await this.jwtService.signAsync({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    res.cookie('userAuthenticated', token, {
      httpOnly: true,
      maxAge: 1 * 60 * 60 * 1000,
      sameSite: 'none',
      secure: true,
    });
    delete user.password;
    return res.send({
      message: 'User logged in successfully',
      userToken: token,
      userDetails: user,
    });
  }
  async logout(@Req() req: Request, @Res() res: Response) {
    const clearCookie = res.clearCookie('userAuthenticated');

    const response = res.send('user successfully logged out');
    return { clearCookie, response };
  }
  async user(headers: any): Promise<any> {
    const authorizationHeader = headers.authorization;
    if (authorizationHeader) {
      const token = authorizationHeader.replace('Bearer ', '');
      const secret = process.env.JWT_SECRET;
      try {
        const decoded = this.jwtService.verify(token);
        let id = decoded['id'];
        let user = await this.userRepo.findOneBy({ id });
        // delete user.password;
        return {
          id: id,
          name: user.username,
          email: user.email,
          role: user.role,
        };
      } catch (err) {
        throw new UnauthorizedException('Invalid token or unauthorized access');
      }
    } else {
      throw new UnauthorizedException('Invalid or mssing Bearer token');
    }
  }
  async findEmail(email: string) {
    const user = await this.userRepo.findOneBy({ email: email });
    if (!user) {
      throw new NotFoundException('user not found');
    } else {
      return user;
    }
  }
  async getAllUser() {
    return await this.userRepo.find();
  }

  async isBlocked(id: string): Promise<boolean> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return user.isBlocked;
  }
  async blockUser(id: string): Promise<void> {
    await this.userRepo.update(id, { isBlocked: true });
  }

  async unblockUser(id: string): Promise<void> {
    await this.userRepo.update(id, { isBlocked: false });
  }
}
