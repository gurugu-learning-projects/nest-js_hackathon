import { validate } from 'class-validator';

import { IsAfterDate } from './is-after-date.js';

class DatesDto {
  startDate: unknown;

  @IsAfterDate('startDate')
  endDate: unknown;
}

describe('IsAfterDate', () => {
  it('passes when endDate is after startDate', async () => {
    const dto = new DatesDto();
    dto.startDate = new Date('2026-09-01T00:00:00.000Z');
    dto.endDate = new Date('2026-09-08T00:00:00.000Z');

    await expect(validate(dto)).resolves.toEqual([]);
  });

  it('fails when endDate is not after startDate', async () => {
    const dto = new DatesDto();
    dto.startDate = new Date('2026-09-08T00:00:00.000Z');
    dto.endDate = new Date('2026-09-01T00:00:00.000Z');

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0]?.constraints).toEqual({
      isAfterDate: 'endDate must be after startDate',
    });
  });

  it('fails when either value is not a valid date', async () => {
    const dto = new DatesDto();
    dto.startDate = '2026-09-01';
    dto.endDate = new Date('2026-09-08T00:00:00.000Z');

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0]?.constraints).toHaveProperty('isAfterDate');
  });
});
