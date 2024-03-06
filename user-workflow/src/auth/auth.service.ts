import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { UserService } from 'src/user/user.service';
import { LoginDto } from './dto/login.dto';
import { EmailService } from 'src/email/email.service';
import { catchError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly emailService: EmailService,
  ) {}
  async register(registerDto: RegisterDto) {
    try {
      const { email, password } = registerDto;

      const existingUser = await this.userService.findOneByEmail(email);
      if (existingUser) {
        throw new BadRequestException('User already exists');
      }

      const hashedPassword = await this.userService.hashPassword(password);
      const newUser = await this.userService.createUser({
        ...registerDto,
        password: hashedPassword,
      });
      await this.emailService.sendUserConfirmation(newUser.email, newUser.name);
      return { user: newUser };
    } catch (error) {
      throw new RpcException(error);
    }
  }
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new BadRequestException("User doesn't exist");
    }

    const isPasswordValid = await this.userService.comparePasswords(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  // update(id: number, updateAuthDto: UpdateAuthDto) {
  //   return `This action updates a #${id} auth`;
  // }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
