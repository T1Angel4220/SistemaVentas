// Mock del servicio de email para testing

const sendVerificationEmail = jest.fn().mockResolvedValue(true);

const sendPasswordResetEmail = jest.fn().mockResolvedValue(true);

const sendAccountStatusEmail = jest.fn().mockResolvedValue(true);

const sendNewSessionEmail = jest.fn().mockResolvedValue(true);

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendAccountStatusEmail,
  sendNewSessionEmail
};

