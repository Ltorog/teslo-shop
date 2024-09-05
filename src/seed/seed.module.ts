import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';

import { ProductsModule } from 'src/products/products.module';
import { User } from 'src/auth/entities/user.entity';


@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [
    TypeOrmModule.forFeature([ User ]),
    ProductsModule,
    PassportModule.register({
      defaultStrategy: 'jwt'
    })
  ]
})
export class SeedModule {}
