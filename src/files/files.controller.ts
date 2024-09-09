import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter, fileNamer } from './helpers';
import { diskStorage } from 'multer';
import express, {Request, Response} from 'express';
import { Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ApiTags } from '@nestjs/swagger';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
  ) {}


  @Post('product')
  @UseInterceptors( FileInterceptor('file', {
    fileFilter: fileFilter,
    storage: diskStorage({
      destination: './public/products',
      filename: fileNamer
    })
  }) )
  async uploadProductImage(
      @UploadedFile() file: Express.Multer.File,
    ) {

    if (!file) {
      throw new BadRequestException('Make sure that the file is an image')
    }

    const secureUrl = `${this.configService.get('HOST_API')}/api/files/product/${file.filename}`

    return {
      fileUrl: secureUrl
    };
  }

  @Get('product/:imageName')
  async getProductImage(
    @Res() res: Response,
    @Param('imageName') imageName: string
    ) {

    const path = await this.filesService.getProductImage(imageName);
    
    res.sendFile(path);
  }
}
