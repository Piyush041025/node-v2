import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const endTime = Date.now();
      const elapsedTime = endTime - startTime;
      const elapsedTimeInMs = (elapsedTime / 1000).toFixed(2);
      const { method, originalUrl } = req;
      const { statusCode } = res;
      console.log(`${method} ${originalUrl} ${statusCode} ${elapsedTimeInMs} ms`);
    });

    next();
  }
}
