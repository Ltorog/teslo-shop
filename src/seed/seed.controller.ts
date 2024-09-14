import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';

import { SeedService } from './seed.service';

import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';

import { ApiTags } from '@nestjs/swagger';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  //@Auth()
  async executeSeed(
    //@GetUser() user: User
  ) {
    return await this.seedService.runSeed(undefined);
  }
}
