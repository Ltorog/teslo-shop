import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";


export const RawHeaders = createParamDecorator(
    (data, ctx: ExecutionContext) => {
        
        const req = ctx.switchToHttp().getRequest();

        const headers = req.headers;

        return !data ? headers : headers[data];
    }
)