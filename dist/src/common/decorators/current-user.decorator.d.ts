export interface AuthenticatedUser {
    id: string;
    email: string;
    role: string;
    clientId: string | null;
    fullName: string;
}
export declare const CurrentUser: (...dataOrPipes: (import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>> | keyof AuthenticatedUser)[]) => ParameterDecorator;
