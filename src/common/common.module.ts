import { Module, Global } from '@nestjs/common';
import { ApiResponseHelper } from './helpers/api-response.helper';
import { LoggerService } from './services/logger.service';
import { RolesGuard } from './guards/roles.guard';
import { OwnershipGuard } from './guards/ownership.guard';

@Global()
@Module({
  providers: [ApiResponseHelper, LoggerService, RolesGuard, OwnershipGuard],
  exports: [ApiResponseHelper, LoggerService, RolesGuard, OwnershipGuard],
})
export class CommonModule {}
