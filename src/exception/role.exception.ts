import { ForbiddenException } from '@nestjs/common';

export class forBiddenRoleException extends ForbiddenException {
  constructor(role: string) {
    super(`User does not have the role: ${role} for this endpoint`);
  }
}
