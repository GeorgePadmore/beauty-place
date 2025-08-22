import { Module, Global } from '@nestjs/common';
import { ApiResponseHelper } from './helpers/api-response.helper';
import { LoggerService } from './services/logger.service';

@Global()
@Module({
  providers: [ApiResponseHelper, LoggerService],
  exports: [ApiResponseHelper, LoggerService],
})
export class CommonModule {}
