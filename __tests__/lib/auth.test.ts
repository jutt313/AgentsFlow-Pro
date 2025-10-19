import { hashPassword, verifyPassword, generateTokens, verifyAccessToken, verifyRefreshToken } from '@/lib/auth';

describe('Auth Library', () => {
  describe('Password Hashing', () => {
    it('should hash a password', async () => {
      const password = 'testpassword123';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should verify correct password', async () => {
      const password = 'testpassword123';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);
      
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'testpassword123';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword('wrongpassword', hash);
      
      expect(isValid).toBe(false);
    });
  });

  describe('Token Generation', () => {
    it('should generate access and refresh tokens', () => {
      const payload = {
        userId: 'user123',
        email: 'test@example.com',
      };
      
      const tokens = generateTokens(payload);
      
      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
    });
  });

  describe('Token Verification', () => {
    it('should verify valid access token', () => {
      const payload = {
        userId: 'user123',
        email: 'test@example.com',
      };
      
      const tokens = generateTokens(payload);
      const verified = verifyAccessToken(tokens.accessToken);
      
      expect(verified).toBeDefined();
      expect(verified?.userId).toBe(payload.userId);
      expect(verified?.email).toBe(payload.email);
    });

    it('should return null for invalid access token', () => {
      const verified = verifyAccessToken('invalid-token');
      
      expect(verified).toBeNull();
    });

    it('should verify valid refresh token', () => {
      const payload = {
        userId: 'user123',
        email: 'test@example.com',
      };
      
      const tokens = generateTokens(payload);
      const verified = verifyRefreshToken(tokens.refreshToken);
      
      expect(verified).toBeDefined();
      expect(verified?.userId).toBe(payload.userId);
      expect(verified?.email).toBe(payload.email);
    });

    it('should return null for invalid refresh token', () => {
      const verified = verifyRefreshToken('invalid-token');
      
      expect(verified).toBeNull();
    });
  });
});

