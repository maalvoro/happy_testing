// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => {
      const response = { data, status: options?.status || 200 };
      response.cookies = {
        set: jest.fn(),
      };
      return response;
    }),
  },
}));

// Mock PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => require('../mocks/prisma').prismaMock),
}));

// Mock bcryptjs
jest.mock('bcryptjs', () => require('../mocks/bcrypt').bcrypt);

import { POST } from '../../src/app/api/login/route';
import { prismaMock } from '../mocks/prisma';
import { bcrypt } from '../mocks/bcrypt';

describe('POST /api/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if fields are missing', async () => {
    const request = {
      json: jest.fn().mockResolvedValue({ email: 'test@example.com' }),
    } as any;

    await POST(request);

    expect(require('next/server').NextResponse.json).toHaveBeenCalledWith(
      { error: 'Missing fields' },
      { status: 400 }
    );
  });

  it('should return 401 if user does not exist', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    const request = {
      json: jest.fn().mockResolvedValue({
        email: 'test@example.com',
        password: 'password123',
      }),
    } as any;

    await POST(request);

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    expect(require('next/server').NextResponse.json).toHaveBeenCalledWith(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  });

  it('should return 401 if password is invalid', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      password: 'hashedpassword',
    } as any);
    bcrypt.compare.mockResolvedValue(false);

    const request = {
      json: jest.fn().mockResolvedValue({
        email: 'test@example.com',
        password: 'wrongpassword',
      }),
    } as any;

    await POST(request);

    expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedpassword');
    expect(require('next/server').NextResponse.json).toHaveBeenCalledWith(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  });

  it('should login successfully and set cookie', async () => {
    const user = {
      id: 1,
      email: 'test@example.com',
      password: 'hashedpassword',
    };
    prismaMock.user.findUnique.mockResolvedValue(user as any);
    bcrypt.compare.mockResolvedValue(true);

    const request = {
      json: jest.fn().mockResolvedValue({
        email: 'test@example.com',
        password: 'password123',
      }),
    } as any;

    const result = await POST(request);

    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
    expect(require('next/server').NextResponse.json).toHaveBeenCalledWith({ user });
    expect(result.cookies.set).toHaveBeenCalledWith('session', '1', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });
  });
});