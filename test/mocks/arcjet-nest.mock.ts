import { CanActivate, Module } from '@nestjs/common';

export class ArcjetGuard implements CanActivate {
  canActivate(): boolean {
    return true;
  }
}

@Module({})
class ArcjetModuleStub {}

export const ArcjetModule = {
  forRoot: () => ({
    module: ArcjetModuleStub,
    global: true,
    providers: [],
    exports: [],
  }),
};

export const shield = (): Record<string, never> => ({});

export const fixedWindow = (): Record<string, never> => ({});
