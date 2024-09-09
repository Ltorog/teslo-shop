import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

import { ProductImage } from './';
import { User } from 'src/auth/entities/user.entity';
import { ApiProperty } from "@nestjs/swagger";

@Entity({
    name: "products"
})
export class Product {

    @ApiProperty({ 
        example: '1e5de29e-7aa7-4261-bff0-2f86eefd492f',
        description: 'Product ID',
        uniqueItems: true
     })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ 
        example: 'TShirt Teslo',
        description: 'Product Title',
        uniqueItems: true
    })
    @Column('text', {
        unique: true
    })
    title: string;

    @ApiProperty({ 
        example: '0',
        description: 'Product price'
    })
    @Column('float', {
        default: 0
    })
    price: number;

    @ApiProperty({ 
        example: 'Lorem impsum',
        description: 'Product description'
    })
    @Column({
        type: 'text',
        nullable: true
    })
    description: string;

    @ApiProperty({ 
        example: 't_shirt_teslo',
        description: 'Product slug',
        uniqueItems: true
    })
    @Column('text', {
        unique: true
    })
    slug: string;

    @ApiProperty({ 
        example: 10,
        description: 'Product stock',
    })
    @Column('int', {
        default: 0
    })
    stock: number;

    @ApiProperty({ 
        example: ['M', 'XL'],
        description: 'Product sizes',
        uniqueItems: true
    })
    @Column('text', {
        array: true
    })
    sizes: string[];

    @ApiProperty({ 
        example: 'woman',
        description: 'Product gender',
        uniqueItems: true
    })
    @Column('text')
    gender: string;

    @ApiProperty({ 
        example: ['Polera', 'Prueba'],
        description: 'Product tags',
        uniqueItems: true
    })
    @Column('text', {
        array: true,
        default: []
    })
    tags: string[];

    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        { cascade: true, eager: true }
    )
    images?: ProductImage[];

    @ManyToOne(
        () => User,
        ( user ) => user.product,
        { eager: true }
    )
    user: User;


    @BeforeInsert()
    checkSlugInsert() {
        if ( !this.slug ) {
            this.slug = this.title;
        }

        this.castSlug()
    }

    @BeforeUpdate()
    checkSlugUpdate() {
        this.castSlug()
    }

    castSlug() {
        this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", '');
    }
}
