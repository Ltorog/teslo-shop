import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

import { META_ROLES } from 'src/auth/decorators/role-protected.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector
  ){}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const validRoles: string[] = this.reflector.get(META_ROLES, context.getHandler());
    
    if (!validRoles) return true;
    if(validRoles.length === 0) return true;
    
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) throw new BadRequestException('User not found');

    for (const rol of user.roles) {
      if (validRoles.includes(rol)) {
        return true;
      }
    }

    console.log({user}, {validRoles});

    throw new ForbiddenException(`User need some of this rol: ${validRoles.join(', ')}`)
  }
}
