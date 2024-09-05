import { Controller, Get, Post, Body, HttpCode, UseGuards, Req, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { GetUser, RawHeaders, RoleProtected, Auth } from './decorators';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { ValidRoles } from './interfaces';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.authService.create(createUserDto);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() loginUserDto: any) {
    return await this.authService.logInUser(loginUserDto);
  }

  @Get('check-status')
  @Auth()
  async checkAuthStatus(
    @GetUser() user: User
  ) {
    return await this.authService.checkAuthStatus(user); 
  }


  @Get('private')
  @UseGuards( AuthGuard() )
  async testingPrivateRoute(
    // @Req() request: Express.Request,
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[]
  ) {
    return {
      ok: true,
      message: 'Test route',
      userEmail: userEmail,
      user,
      rawHeaders
    }
  }

  @Get('private2')
  @RoleProtected(ValidRoles.superUser, ValidRoles.admin)
  @UseGuards( AuthGuard(), UserRoleGuard )
  async testingPrivateRoute2(
    @GetUser() user: User
  ) {
    return {
      ok: true,
      user
    }
  }

  @Get('private3')
  @Auth()
  async testingPrivateRoute3(
    @GetUser() user: User
  ) {
    return {
      ok: true,
      user
    }
  }

}
