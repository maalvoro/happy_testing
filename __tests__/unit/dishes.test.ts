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

// Mock requireSession
jest.mock('@/app/lib/auth', () => ({
  requireSession: jest.fn(),
}));

import { GET, POST } from '../../src/app/api/dishes/route';
import { prismaMock } from '../mocks/prisma';
import { requireSession } from '@/app/lib/auth';

describe('GET /api/dishes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if no session', async () => {
    (requireSession as jest.Mock).mockRejectedValue(new Error('NO_SESSION'));

    await GET();

    expect(requireSession).toHaveBeenCalled();
    expect(require('next/server').NextResponse.json).toHaveBeenCalledWith(
      { error: 'No autorizado' },
      { status: 401 }
    );
  });

  it('should return dishes for user', async () => {
    (requireSession as jest.Mock).mockResolvedValue('1');
    prismaMock.dish.findMany.mockResolvedValue([
      { id: 1, name: 'Dish 1', userId: 1 },
    ] as any);

    await GET();

    expect(requireSession).toHaveBeenCalled();
    expect(prismaMock.dish.findMany).toHaveBeenCalledWith({ where: { userId: 1 } });
    expect(require('next/server').NextResponse.json).toHaveBeenCalledWith({
      dishes: [{ id: 1, name: 'Dish 1', userId: 1 }],
    });
  });
});

describe('POST /api/dishes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if no session', async () => {
    (requireSession as jest.Mock).mockRejectedValue(new Error('NO_SESSION'));

    const request = {
      json: jest.fn().mockResolvedValue({ name: 'Test Dish' }),
    } as any;

    await POST(request);

    expect(requireSession).toHaveBeenCalled();
    expect(require('next/server').NextResponse.json).toHaveBeenCalledWith(
      { error: 'No autorizado' },
      { status: 401 }
    );
  });

  it('should return 400 if fields are missing', async () => {
    (requireSession as jest.Mock).mockResolvedValue('1');

    const request = {
      json: jest.fn().mockResolvedValue({ name: 'Test Dish' }), // missing description, prepTime, cookTime
    } as any;

    await POST(request);

    expect(require('next/server').NextResponse.json).toHaveBeenCalledWith(
      { error: 'Missing fields' },
      { status: 400 }
    );
  });

  it('should create dish successfully', async () => {
    (requireSession as jest.Mock).mockResolvedValue('1');
    prismaMock.dish.create.mockResolvedValue({
      id: 1,
      name: 'Test Dish',
      description: 'Description',
      quickPrep: false,
      prepTime: 10,
      cookTime: 20,
      imageUrl: null,
      userId: 1,
      steps: [],
      calories: null,
    } as any);

    const request = {
      json: jest.fn().mockResolvedValue({
        name: 'Test Dish',
        description: 'Description',
        prepTime: 10,
        cookTime: 20,
      }),
    } as any;

    await POST(request);

    expect(prismaMock.dish.create).toHaveBeenCalledWith({
      data: {
        name: 'Test Dish',
        description: 'Description',
        quickPrep: false,
        prepTime: 10,
        cookTime: 20,
        imageUrl: undefined,
        userId: 1,
        steps: [],
        calories: null,
      },
    });
    expect(require('next/server').NextResponse.json).toHaveBeenCalledWith({
      dish: expect.any(Object),
    });
  });

  it('should return 500 on error', async () => {
    (requireSession as jest.Mock).mockResolvedValue('1');
    prismaMock.dish.create.mockRejectedValue(new Error('Database error'));

    const request = {
      json: jest.fn().mockResolvedValue({
        name: 'Test Dish',
        description: 'Description',
        prepTime: 10,
        cookTime: 20,
      }),
    } as any;

    await POST(request);

    expect(require('next/server').NextResponse.json).toHaveBeenCalledWith(
      { error: 'Database error' },
      { status: 500 }
    );
  });
});