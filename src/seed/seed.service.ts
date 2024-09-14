import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { initialData } from './data/seed-data'; 

import { User } from 'src/auth/entities/user.entity';
import { ProductsService } from 'src/products/products.service';


@Injectable()
export class SeedService {
  constructor(
    private readonly productsService: ProductsService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ){};

  async runSeed(user: User | undefined) {

    await this.deleteTables();
    const adminUser = await this.insertUsers();

    await this.insertNewProducts(adminUser);
    return 'SEED EXECUTED'
  }

  private async insertNewProducts(user: User) {
    await this.productsService.deleteAllProducts();

    const seedProducts = initialData.products;

    const insertPromises = [];
    seedProducts.forEach(product => {
      insertPromises.push(this.productsService.create(product, user));
    })

    await Promise.all(insertPromises);

    return true;
  }

  private async deleteTables() {

    await this.productsService.deleteAllProducts();

    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder
      .delete()
      .where({})
      .execute()

  }


  private async insertUsers() {

    const seedUsers = initialData.users;

    const users: User[] = [];
    seedUsers.forEach( user => {
      users.push(this.userRepository.create(user));
    })

    const dbUsers = await this.userRepository.save(seedUsers);

    return dbUsers[0];
  }
}
