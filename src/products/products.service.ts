import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { validate as UUID } from 'uuid';

import { ProductImage } from './entities';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { PaginationDto } from 'src/common/dtos/pagination.dto';

import { User } from 'src/auth/entities/user.entity';


@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');
  
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource
  ) {}
  
  
  async create(createProductDto: CreateProductDto, user: User) {
    try {
      const { images = [], ...productDetails } = createProductDto
      this.logger.debug(createProductDto);
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map(image => this.productImageRepository.create({ url: image })),
        user: user
      });
      this.logger.debug(JSON.stringify(product));

      await this.productRepository.save(product);

      return { ...product, ...images };
    }
    catch (error) {
      this.handleDBException(error);
    }

  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true
      }
    });
    
    return products.map( ({images, ...productDetails }) => ({
      ...productDetails,
      images: images.map( image => image.url)
    }));
  }

  async findOne(term: string) {
    let product: Product;

    if (UUID(term)) {
      product = await this.productRepository.findOneBy({id: term});
    }
    else {
      const queryBuilder = this.productRepository.createQueryBuilder('products');

      product = await queryBuilder
        .where('UPPER(title)=:title or slug=:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase()
        })
        .leftJoinAndSelect('products.images', 'productImages')
        .getOne();
    }

    if (!product) throw new NotFoundException(`Product with id ${term} not found`);
    
    return product
  }

  async findOnePlain(term: string) {
    const { images = [], ...details } = await this.findOne( term );

    return {
      ...details,
      images: images.map((image) => image.url)
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {
    const { images, ...toUpdate} = updateProductDto;

    const product = await this.productRepository.preload({
      id: id,
      ...toUpdate
    });

    if (!product) throw new NotFoundException(`Product with id ${id} not found`);

    // Create query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if ( images ) {
        await queryRunner.manager.delete( ProductImage, { product: { id } } );

        product.images = images.map(
          image => this.productImageRepository.create({url: image})
        )
      }

      product.user = user;

      await queryRunner.manager.save( product );

      await queryRunner.commitTransaction();
      await queryRunner.release();
    }
    catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      return this.handleDBException(error);
    }
    
    return this.findOnePlain(id);
  }

  async remove(id: string) {
    const product = await this.productRepository.findOneBy({id: id});

    if ( !product ) throw new NotFoundException(`Product with id ${id} not found`);

    await this.productRepository.remove( product );

    return {message: `Removes a #${id} product`};
  }

  private handleDBException(error: any) {
    this.logger.error(error);
    if (error.code === '23505')
      throw new BadRequestException(error.detail);

    
    throw new InternalServerErrorException('Ayuda')
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');

    try {
      return await query
        .delete()
        .where({})
        .execute();
    }
    catch (error) {
      this.handleDBException(error);
    }
  }
}
