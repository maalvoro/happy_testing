// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    redirect: jest.fn((url) => {
      const response = { url };
      response.cookies = {
        set: jest.fn(),
      };
      return response;
    }),
  },
}));

import { POST } from '../../src/app/api/logout/route';

describe('POST /api/logout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should redirect to login and clear session cookie', async () => {
    const result = await POST();

    expect(require('next/server').NextResponse.redirect).toHaveBeenCalledWith('http://localhost:3000/login');
    expect(result.cookies.set).toHaveBeenCalledWith('session', '', {
      path: '/',
      expires: new Date(0),
    });
  });
});