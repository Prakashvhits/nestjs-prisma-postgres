import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
// import { extractTokenFromHeader } from "src/utils/common.services";

@Injectable()
export class RefreshTokenGuard implements CanActivate {
    constructor(private jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        // const token = await extractTokenFromHeader(request);
        const token = request.cookies?.refreshToken;


        if (!token) {
            throw new UnauthorizedException();
        }

        try {
            console.log(token, "token");
            
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_REFRESH_SECRET,
            });
            console.log(payload);
            
            request['User'] = payload;
            return true; // Token is valid, allow access
        } catch (error) {
            console.log(error);
            throw new UnauthorizedException(error);
        }
    }
}
