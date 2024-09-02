import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { ENV_VARIABLES } from 'src/config/env.config';
import { validatePassword } from 'src/utils/password.utils';
import { User } from 'src/modules/user/entities/user.entity';
import { UserService } from 'src/modules/user/services/user.service';
import type { CreateUserPayload } from 'src/modules/user/dtos/create-user.dto';
import { BadRequestError } from 'src/lib/http-exceptions/errors/types/bad-request-error';

import type { AccessDTO } from '../dtos/access.dto';
import type { LoginPayload } from '../dtos/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn({ password, user_email }: LoginPayload): Promise<AccessDTO> {
    const user = await this.usersService.getUserByEmail(user_email);

    await this.validatePassword(user, password);

    const access_token = await this.generateAccessToken(user);

    return this.buildAccessDTO(user, access_token);
  }

  public async registerAndLogin({
    password,
    user_email,
    user_name,
    phone_number,
    date_of_birth,
  }: CreateUserPayload): Promise<AccessDTO> {
    const newUser = await this.usersService.createUser({
      user_email,
      user_name,
      password,
      phone_number,
      date_of_birth,
    });

    const access_token = await this.generateAccessToken(newUser);

    return this.buildAccessDTO(newUser, access_token);
  }

  private async validatePassword(user: User, password: string): Promise<void> {
    const passwordsMatch = await validatePassword(
      password,
      user.hashed_password,
    );

    if (!passwordsMatch) {
      throw new BadRequestError('Senha incorreta');
    }
  }

  private async generateAccessToken(user: User): Promise<string> {
    const { access_token } = await this.getAccessToken({
      id: user.id,
    });

    return access_token;
  }

  private buildAccessDTO(user: User, access_token: string): AccessDTO {
    return {
      user: {
        id: user.id,
        user_name: user.user_name,
        user_email: user.user_email,
        created_at: user.created_at,
        updated_at: user.updated_at,
        phone_number: user.phone_number,
        date_of_birth: user.date_of_birth,
      },
      access_token,
    };
  }

  async getAccessToken(jwtPayload: IJwtPayload) {
    const access_token = await this.jwtService.signAsync(jwtPayload, {
      secret: ENV_VARIABLES.JWT_SECRET,
      expiresIn: ENV_VARIABLES.JWT_EXPIRES_IN,
    });

    return {
      access_token,
    };
  }
}
