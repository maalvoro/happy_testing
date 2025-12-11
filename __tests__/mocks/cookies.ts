import { mockDeep } from 'jest-mock-extended';
import { cookies } from 'next/headers';

export const cookiesMock = mockDeep<typeof cookies>();