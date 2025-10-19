// Mock del servicio JWT para testing

const generateSessionTokens = jest.fn((user) => ({
  accessToken: `mock_access_token_${user.id}`,
  refreshToken: `mock_refresh_token_${user.id}`,
  expiresIn: '1h'
}));

const generateEmailVerificationToken = jest.fn(() => '123456');

const generatePasswordResetToken = jest.fn(() => '123456');

const verifyEmailVerificationToken = jest.fn(() => true);

const verifyPasswordResetToken = jest.fn(() => true);

const verifyToken = jest.fn((token) => ({
  id: 1,
  email: 'test@example.com',
  tipo_usuario: 'comprador',
  estado: 'activo'
}));

const extractTokenFromHeader = jest.fn((authHeader) => {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  return parts[1];
});

module.exports = {
  generateSessionTokens,
  generateEmailVerificationToken,
  generatePasswordResetToken,
  verifyEmailVerificationToken,
  verifyPasswordResetToken,
  verifyToken,
  extractTokenFromHeader
};

