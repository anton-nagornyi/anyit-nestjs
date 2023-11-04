import { SetMetadata } from '@nestjs/common';

export const IsPublicMetaKey = 'isPublic';

export const IsPublic = () => SetMetadata('IsPublicMetaKey', true);
