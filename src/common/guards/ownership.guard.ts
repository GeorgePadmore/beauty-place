import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OWNERSHIP_KEY } from '../decorators/ownership.decorator';
import { UserRole } from '../../users/entities/user.entity';

export interface OwnershipCheck {
  entityType: string;
  idParam: string;
  ownerField: string;
}

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const ownershipCheck = this.reflector.getAllAndOverride<OwnershipCheck>(OWNERSHIP_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no ownership check is required, allow access
    if (!ownershipCheck) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { user, params } = request;
    
    // If no user (shouldn't happen with JWT guard), deny access
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Admins can access everything
    if (user.role === UserRole.ADMINISTRATOR) {
      return true;
    }

    // Get the entity ID from the request parameters
    const entityId = params[ownershipCheck.idParam];
    
    if (!entityId) {
      throw new ForbiddenException('Entity ID not found in request');
    }

    // For now, we'll allow access and let the service handle the ownership check
    // This guard is more of a framework for future implementation
    // The actual ownership validation should happen in the service layer
    
    return true;
  }
}
