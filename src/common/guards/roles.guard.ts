import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    // If no user (shouldn't happen with JWT guard), deny access
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user has any of the required roles
    const hasRole = requiredRoles.some((role) => user.role === role);
    
    if (!hasRole) {
      const requiredRoleText = requiredRoles.length === 1 
        ? requiredRoles[0] 
        : `${requiredRoles.slice(0, -1).join(', ')} or ${requiredRoles[requiredRoles.length - 1]}`;
      
      throw new ForbiddenException(
        `Access denied. You need ${requiredRoleText} permissions to perform this action.`
      );
    }

    return true;
  }
}
