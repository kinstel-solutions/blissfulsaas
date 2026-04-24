import { validateSync, IsUrl, IsOptional } from 'class-validator';
import { Transform, plainToInstance } from 'class-transformer';

class TestDto {
  @IsUrl()
  @IsOptional()
  @Transform(({ value }) => value === '' ? null : value)
  url?: string;
}

const dto1 = plainToInstance(TestDto, { url: '' });
console.log('DTO1:', dto1);
const errors1 = validateSync(dto1);
console.log('Errors1:', errors1.map(e => e.constraints));

const dto2 = plainToInstance(TestDto, { url: 'https://example.com' });
const errors2 = validateSync(dto2);
console.log('Errors2:', errors2.map(e => e.constraints));

const dto3 = plainToInstance(TestDto, { url: null });
const errors3 = validateSync(dto3);
console.log('Errors3:', errors3.map(e => e.constraints));
