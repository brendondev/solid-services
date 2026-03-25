import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '@core/database';
import { TenantContextService } from '@core/tenant';
import { CreateUserDto, UpdateUserDto, ChangePasswordDto, InviteUserDto, UserRole } from './dto';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockTenantId = 'tenant-123';
  const mockUserId = 'user-456';

  const mockUser = {
    id: mockUserId,
    tenantId: mockTenantId,
    email: 'user@example.com',
    name: 'Test User',
    passwordHash: 'hashed_password',
    roles: [UserRole.VIEWER],
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockTenantContextService = {
    getTenantId: jest.fn().mockReturnValue(mockTenantId),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: TenantContextService,
          useValue: mockTenantContextService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all users in tenant', async () => {
      const mockUsers = [mockUser];
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        where: { tenantId: mockTenantId },
        select: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(mockUsers);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.findOne(mockUserId);

      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: { id: mockUserId, tenantId: mockTenantId },
        select: expect.any(Object),
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create a new user with provided password', async () => {
      const createDto: CreateUserDto = {
        email: 'new@example.com',
        name: 'New User',
        password: 'Password123!',
        roles: [UserRole.VIEWER],
      };

      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create(createDto);

      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          tenantId: mockTenantId,
          email: createDto.email,
        },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(createDto.password, 10);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenantId: mockTenantId,
          email: createDto.email,
          name: createDto.name,
          passwordHash: 'hashed_password',
          roles: createDto.roles,
          status: 'active',
        }),
        select: expect.any(Object),
      });
      expect(result).not.toHaveProperty('tempPassword');
    });

    it('should generate temp password if not provided', async () => {
      const createDto: CreateUserDto = {
        email: 'new@example.com',
        name: 'New User',
        roles: [UserRole.VIEWER],
      };

      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create(createDto);

      expect(bcrypt.hash).toHaveBeenCalled();
      expect(result).toHaveProperty('tempPassword');
      expect(typeof result.tempPassword).toBe('string');
    });

    it('should throw ConflictException if email already exists', async () => {
      const createDto: CreateUserDto = {
        email: 'existing@example.com',
        name: 'User',
        roles: [UserRole.VIEWER],
      };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('invite', () => {
    it('should invite a new user with temp password', async () => {
      const inviteDto: InviteUserDto = {
        email: 'invited@example.com',
        roles: [UserRole.VIEWER],
      };

      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.invite(inviteDto);

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: inviteDto.email,
          name: 'invited', // Email prefix
          roles: inviteDto.roles,
        }),
        select: expect.any(Object),
      });
      expect(result).toHaveProperty('tempPassword');
      expect(result).toHaveProperty('message');
    });

    it('should throw ConflictException if user already exists', async () => {
      const inviteDto: InviteUserDto = {
        email: 'existing@example.com',
        roles: [UserRole.VIEWER],
      };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      await expect(service.invite(inviteDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('update', () => {
    it('should update user data', async () => {
      const updateDto: UpdateUserDto = {
        name: 'Updated Name',
        roles: [UserRole.VIEWER, UserRole.MANAGER],
      };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        ...updateDto,
      });

      const result = await service.update(mockUserId, updateDto);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: expect.objectContaining({
          name: updateDto.name,
          roles: updateDto.roles,
          updatedAt: expect.any(Date),
        }),
        select: expect.any(Object),
      });
      expect(result.name).toBe(updateDto.name);
    });

    it('should throw BadRequestException if removing last admin', async () => {
      const updateDto: UpdateUserDto = {
        roles: [UserRole.VIEWER], // Removing admin role
      };

      const adminUser = { ...mockUser, roles: [UserRole.ADMIN] };

      mockPrismaService.user.findFirst.mockResolvedValue(adminUser);
      mockPrismaService.user.count.mockResolvedValue(1); // Only 1 admin

      await expect(service.update(mockUserId, updateDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update(mockUserId, updateDto)).rejects.toThrow(
        /último administrador/,
      );
    });

    it('should allow removing admin if there are other admins', async () => {
      const updateDto: UpdateUserDto = {
        roles: [UserRole.VIEWER],
      };

      const adminUser = { ...mockUser, roles: [UserRole.ADMIN] };

      mockPrismaService.user.findFirst.mockResolvedValue(adminUser);
      mockPrismaService.user.count.mockResolvedValue(2); // 2 admins
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        roles: [UserRole.VIEWER],
      });

      const result = await service.update(mockUserId, updateDto);

      expect(prismaService.user.update).toHaveBeenCalled();
      expect(result.roles).toEqual([UserRole.VIEWER]);
    });
  });

  describe('remove', () => {
    it('should soft delete user', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        status: 'inactive',
      });

      const result = await service.remove(mockUserId);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: { status: 'inactive' },
      });
      expect(result).toHaveProperty('message');
    });

    it('should throw BadRequestException if removing last admin', async () => {
      const adminUser = { ...mockUser, roles: [UserRole.ADMIN] };

      mockPrismaService.user.findFirst.mockResolvedValue(adminUser);
      mockPrismaService.user.count.mockResolvedValue(1);

      await expect(service.remove(mockUserId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('changePassword', () => {
    it('should change user password', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass123!',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.changePassword(mockUserId, changePasswordDto);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        changePasswordDto.currentPassword,
        mockUser.passwordHash,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(changePasswordDto.newPassword, 10);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: { passwordHash: 'hashed_password' },
      });
      expect(result).toHaveProperty('message');
    });

    it('should throw UnauthorizedException if current password is wrong', async () => {
      const changePasswordDto: ChangePasswordDto = {
        currentPassword: 'WrongPass',
        newPassword: 'NewPass123!',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword(mockUserId, changePasswordDto),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.changePassword('non-existent', {} as ChangePasswordDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('resetPassword', () => {
    it('should reset user password to temp password', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.resetPassword(mockUserId);

      expect(bcrypt.hash).toHaveBeenCalled();
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: { passwordHash: 'hashed_password' },
      });
      expect(result).toHaveProperty('tempPassword');
      expect(result).toHaveProperty('message');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.resetPassword('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
