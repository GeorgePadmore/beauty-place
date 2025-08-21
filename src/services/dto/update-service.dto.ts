import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateServiceDto } from './create-service.dto';

export class UpdateServiceDto extends PartialType(
  OmitType(CreateServiceDto, ['professionalId'] as const),
) {
  // professionalId cannot be updated once set
  // All other fields are optional for updates
}
