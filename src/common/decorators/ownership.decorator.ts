import { SetMetadata } from '@nestjs/common';
import { OwnershipCheck } from '../guards/ownership.guard';

export const OWNERSHIP_KEY = 'ownership';
export const RequireOwnership = (check: OwnershipCheck) => SetMetadata(OWNERSHIP_KEY, check);
