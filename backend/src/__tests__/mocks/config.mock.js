// Mock del módulo config para testing

const config = {
  server: {
    port: 3001,
    host: 'localhost',
    nodeEnv: 'test'
  },
  database: {
    host: 'localhost',
    port: 5432,
    name: 'test_db',
    user: 'test_user',
    password: 'test_password'
  },
  jwt: {
    secret: 'test_secret',
    expiresIn: '1h',
    refreshExpiresIn: '7d'
  },
  email: {
    host: 'smtp.test.com',
    port: 587,
    secure: false,
    user: 'test@test.com',
    password: 'test_password',
    from: 'Test <test@test.com>'
  },
  bcrypt: {
    saltRounds: 10
  },
  cors: {
    origin: 'http://localhost:3000'
  }
};

module.exports = { config };

