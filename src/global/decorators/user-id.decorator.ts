import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const userMetaDate = createParamDecorator(
  (defaultValue: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return { id: +req['user'].id, company: req['user'].company };
  },
);
