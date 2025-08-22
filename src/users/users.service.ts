import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Create a new user
   */
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if user with email already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    // Create user
    const user = this.usersRepository.create({
      ...createUserDto,
      passwordHash: hashedPassword,
    });

    const savedUser = await this.usersRepository.save(user);

    // Return user without password
    return this.mapToResponseDto(savedUser);
  }

  /**
   * Find all users
   */
  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.find({
      where: { isDeleted: false },
      order: { createdAt: 'DESC' },
    });

    return users.map(user => this.mapToResponseDto(user));
  }

  /**
   * Find user by ID
   */
  async findOne(id: string, requestingUserId?: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // If requestingUserId is provided, check ownership
    if (requestingUserId && requestingUserId !== id) {
      // Check if requesting user is admin (future enhancement)
      // For now, only allow users to view their own profile
      throw new ForbiddenException('You can only view your own profile');
    }

    return this.mapToResponseDto(user);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email, isDeleted: false },
    });
  }

  /**
   * Update user
   */
  async update(id: string, updateUserDto: UpdateUserDto, requestingUserId?: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check ownership
    if (requestingUserId && requestingUserId !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }

    // Check if email is being updated and if it's already taken
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: updateUserDto.email, isDeleted: false },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // Update user
    Object.assign(user, updateUserDto);
    const updatedUser = await this.usersRepository.save(user);

    return this.mapToResponseDto(updatedUser);
  }

  /**
   * Soft delete user
   */
  async remove(id: string, requestingUserId?: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check ownership
    if (requestingUserId && requestingUserId !== id) {
      throw new ForbiddenException('You can only delete your own profile');
    }

    // Soft delete
    user.isDeleted = true;
    user.isActive = false;
    await this.usersRepository.save(user);
  }

  /**
   * Verify user password
   */
  async verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }

  /**
   * Find users by role
   */
  async findByRole(role: UserRole): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.find({
      where: { role, isDeleted: false, isActive: true },
      order: { createdAt: 'DESC' },
    });

    return users.map(user => this.mapToResponseDto(user));
  }

  /**
   * Activate/deactivate user
   */
  async toggleActive(id: string, requestingUserId?: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check ownership
    if (requestingUserId && requestingUserId !== id) {
      throw new ForbiddenException('You can only toggle your own profile status');
    }

    user.isActive = !user.isActive;
    const updatedUser = await this.usersRepository.save(user);

    return this.mapToResponseDto(updatedUser);
  }

  /**
   * Map user entity to response DTO
   */
  private mapToResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
