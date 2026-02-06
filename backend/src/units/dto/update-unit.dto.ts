import { PartialType } from '@nestjs/swagger';
import { CreateUnitDto } from './create-unit.dto';
import { OmitType } from '@nestjs/swagger';

export class UpdateUnitDto extends PartialType(
  OmitType(CreateUnitDto, ['propertyId'] as const),
) {}
