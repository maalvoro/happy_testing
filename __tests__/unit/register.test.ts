// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({ data, status: options?.status || 200 })),
  },
}));

// Mock PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => require('../mocks/prisma').prismaMock),
}));

// Mock bcryptjs
jest.mock('bcryptjs', () => require('../mocks/bcrypt').bcrypt);

import { POST } from '../../src/app/api/register/route';
import { prismaMock } from '../mocks/prisma';
import { bcrypt } from '../mocks/bcrypt';

describe('POST /api/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if fields are missing', async () => {
    const request = {
      json: jest.fn().mockResolvedValue({ firstName: 'John', lastName: 'Doe' }),
    } as any;

    await POST(request);

    expect(require('next/server').NextResponse.json).toHaveBeenCalledWith(
      { error: 'Missing fields' },
      { status: 400 }
    );
  });

  it('should return 409 if user already exists', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 1, email: 'test@example.com' } as any);

    const request = {
      json: jest.fn().mockResolvedValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        nationality: 'US',
        phone: '123456789',
        password: 'password123',
      }),
    } as any;

    await POST(request);

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    expect(require('next/server').NextResponse.json).toHaveBeenCalledWith(
      { error: 'El email ya está registrado' },
      { status: 409 }
    );
  });

  it('should create user successfully', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      nationality: 'US',
      phone: '123456789',
      password: 'hashedpassword',
    } as any);
    bcrypt.hash.mockResolvedValue('hashedpassword');

    const request = {
      json: jest.fn().mockResolvedValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        nationality: 'US',
        phone: '123456789',
        password: 'password123',
      }),
    } as any;

    await POST(request);

    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        nationality: 'US',
        phone: '123456789',
        password: 'hashedpassword',
      },
    });
    expect(require('next/server').NextResponse.json).toHaveBeenCalledWith({ user: expect.any(Object) });
  });

  it('should return 500 on error', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockRejectedValue(new Error('Database error'));

    const request = {
      json: jest.fn().mockResolvedValue({
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
        nationality: 'US',
        phone: '123456789',
        password: 'password123',
      }),
    } as any;

    await POST(request);

    expect(require('next/server').NextResponse.json).toHaveBeenCalledWith(
      { error: 'Database error' },
      { status: 500 }
    );
  });
});