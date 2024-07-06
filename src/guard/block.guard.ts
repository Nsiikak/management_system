import { Injectable, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { UserService } from '../user/user.service';

@Injectable()
export class BlockGuard {
  constructor(private readonly usersService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const user = ctx.getContext().user;

    if (user) {
      const isBlocked = await this.usersService.isBlocked(
        ctx.getContext().user.id,
      );
      if (isBlocked) {
        return false;
      }
    }

    return true;
  }
}
