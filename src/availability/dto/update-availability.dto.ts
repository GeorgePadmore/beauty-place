import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateAvailabilityDto } from './create-availability.dto';

export class UpdateAvailabilityDto extends PartialType(
  OmitType(CreateAvailabilityDto, ['professionalId'] as const)
) {
  // All fields are optional for updates, except professionalId which cannot be changed
}
