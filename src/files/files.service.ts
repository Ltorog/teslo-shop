import { join } from 'path';

import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';

@Injectable()
export class FilesService {
    async getProductImage(imageName: string) {
        const path = join(__dirname, '../../public/products', imageName);

        if (!existsSync(path)) {
            throw new BadRequestException(`File not found with name ${imageName}`);
        }

        return path;
    }
}
