import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class PositiveIntPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const id = Number(value);

    if (!Number.isInteger(id)) {
      throw new BadRequestException('id must be an integer');
    }

    if (id <= 0) {
      throw new BadRequestException('id > 0');
    }

    return id;
  }
}
