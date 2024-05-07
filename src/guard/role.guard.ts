/* eslint-disable prefer-const */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { userRole } from 'enum/role.enum';
import { forBiddenRoleException } from '../exception/role.exception';
import { UserService } from '../user/user.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private userService: UserService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<userRole[]>('roles', context.getHandler());
    // console.log('roles', roles)

    const request = context.switchToHttp().getRequest();
    if (request?.user) {
      const headers: Headers = request.headers;
      let user = this.userService.user(headers);

      if (!roles.includes((await user).role)) {
        throw new forBiddenRoleException(roles.join(' or '));
      }
      return true;
    }
    return false;
  }
}
