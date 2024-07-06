import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  Get,
  UseGuards,
  HttpCode,
  Param,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginDto } from '../dto/login.dto';
import { Request, Response } from 'express';
import { Roles } from '../guard/role';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../guard/role.guard';
import { userRole } from 'enum/role.enum';
import { BlockGuard } from 'src/guard/block.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.signUp(createUserDto);
  }

  @Post('login')
  async login(
    @Body() payload: LoginDto,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<any> {
    return await this.userService.login(payload, req, res);
  }
  @HttpCode(200)
  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    return await this.userService.logout(req, res);
  }
  @Get()
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(userRole.admin, userRole.manager)
  findAll() {
    return this.userService.getAllUser();
  }
  @Put('block/:id')
  @UseGuards(AuthGuard(), RolesGuard, BlockGuard)
  @Roles(userRole.admin, userRole.manager, userRole.member)
  async blockUser(@Param('id') id: string) {
    await this.userService.blockUser(id);
    return { message: 'user blocked' };
  }
  @Put('unblock/:id')
  @UseGuards(AuthGuard(), RolesGuard, BlockGuard)
  @Roles(userRole.admin, userRole.manager, userRole.member)
  async unblockUser(@Param('id') id: string) {
    await this.userService.unblockUser(id);
  }
}
