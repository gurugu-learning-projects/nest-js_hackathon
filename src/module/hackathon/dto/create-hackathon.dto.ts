import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsOptional,
  IsString,
  MaxLength,
  MinDate,
  MinLength,
} from 'class-validator';

import { IsAfterDate } from '../../../common/validators/is-after-date.js';

export class CreateHackathonDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' && value.trim() === '' ? undefined : value,
  )
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  description?: string;

  @Type(() => Date)
  @IsDate({ message: 'startDate must be a valid date' })
  @MinDate(() => new Date(), {
    message: 'startDate must be a future date',
  })
  startDate: Date;

  @Type(() => Date)
  @IsDate({ message: 'endDate must be a valid date' })
  @MinDate(() => new Date(), {
    message: 'endDate must be a future date',
  })
  @IsAfterDate('startDate', {
    message: 'endDate must be after startDate',
  })
  endDate: Date;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
