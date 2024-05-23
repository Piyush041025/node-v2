import { Injectable } from '@nestjs/common';
import { CalcDto } from './calc.dto';

@Injectable()
export class CalcService {
  calculateExpression(calcBody: CalcDto) {
    try {
      console.log("request body: ", calcBody);
      const expression = calcBody.expression.replace(/\s+/g, '');
      if (!expression) {
        throw new Error('Invalid expression');
      }

      const tokens = this.tokenize(expression);
      if (tokens.length === 0 || this.endsWithOperator(tokens)) {
        throw new Error('Invalid expression');
      }

      const result = this.evaluate(tokens);

      return { result: result };
    } catch (error) {
      return {
        statusCode: 400,
        message: 'Invalid expression provided',
        error: 'Bad Request'
      };
    }
  }

  private tokenize(expression: string): string[] {
    const tokens: string[] = [];
    let numberBuffer = '';

    for (let char of expression) {
      if (/\d/.test(char)) {
        numberBuffer += char;
      } else if (['+', '-', '*', '/'].includes(char)) {
        if (numberBuffer) {
          tokens.push(numberBuffer);
          numberBuffer = '';
        }
        tokens.push(char);
      } else {
        throw new Error('Invalid character in expression');
      }
    }

    if (numberBuffer) {
      tokens.push(numberBuffer);
    }

    return tokens;
  }

  private endsWithOperator(tokens: string[]): boolean {
    const lastToken = tokens[tokens.length - 1];
    return ['+', '-', '*', '/'].includes(lastToken);
  }

  private evaluate(tokens: string[]): number {
    const outputQueue: any[] = [];
    const operatorStack: string[] = [];

    const precedence: { [key: string]: number } = {
      '+': 1,
      '-': 1,
      '*': 2,
      '/': 2
    };

    const applyOperator = (op: string, b: number, a: number): number => {
      switch (op) {
        case '+':
          return a + b;
        case '-':
          return a - b;
        case '*':
          return a * b;
        case '/':
          if (b === 0) throw new Error('Division by zero');
          return a / b;
        default:
          throw new Error('Invalid operator');
      }
    };

    tokens.forEach(token => {
      if (!isNaN(parseFloat(token))) {
        outputQueue.push(parseFloat(token));
      } else if (['+', '-', '*', '/'].includes(token)) {
        while (
          operatorStack.length &&
          precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]
        ) {
          const op = operatorStack.pop();
          if (op) {
            const b = outputQueue.pop();
            const a = outputQueue.pop();
            if (a === undefined || b === undefined) throw new Error('Invalid expression');
            outputQueue.push(applyOperator(op, b, a));
          }
        }
        operatorStack.push(token);
      } else {
        throw new Error('Invalid character in expression');
      }
    });

    while (operatorStack.length) {
      const op = operatorStack.pop();
      if (op) {
        const b = outputQueue.pop();
        const a = outputQueue.pop();
        if (a === undefined || b === undefined) throw new Error('Invalid expression');
        outputQueue.push(applyOperator(op, b, a));
      }
    }

    if (outputQueue.length !== 1) throw new Error('Invalid expression');

    return outputQueue[0];
  }
}
