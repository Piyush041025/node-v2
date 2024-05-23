import { Body, Controller, Post, HttpCode, HttpStatus, HttpException } from '@nestjs/common';
import { CalcService } from './calc.service';
import { CalcDto } from './calc.dto';

@Controller('calc')
export class CalcController {
  constructor(private readonly calcService: CalcService) {}

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  calc(@Body() calcBody: CalcDto) {
    const result = this.calcService.calculateExpression(calcBody);
    if (result.statusCode === 400) {
      throw new HttpException({
        statusCode: 400,
        message: result.message,
        error: result.error,
      }, HttpStatus.BAD_REQUEST);
    }
    return result;
  }
}
