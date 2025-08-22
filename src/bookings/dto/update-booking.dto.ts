import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateBookingDto } from './create-booking.dto';

export class UpdateBookingDto extends PartialType(
  OmitType(CreateBookingDto, ['professionalId', 'serviceId'] as const)
) {
  // All fields are optional for updates, except professionalId and serviceId which cannot be changed
}
