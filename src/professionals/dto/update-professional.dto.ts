import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateProfessionalDto } from './create-professional.dto';

export class UpdateProfessionalDto extends PartialType(
  OmitType(CreateProfessionalDto, ['userId'] as const),
) {
  // userId cannot be updated once set
  // All other fields are optional for updates
}
