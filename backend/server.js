require('dotenv').config();
const app = require('./src/app');
const { testConnection } = require('./src/config/db');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 5000;

// Test DB connection then start server
testConnection().then(() => {
  app.listen(PORT, () => {
    logger.info(`🚀 Road2Career API server running on port ${PORT}`);
    logger.info(`📍 Environment: ${process.env.NODE_ENV}`);
  });
}).catch((err) => {
  logger.error('Failed to connect to database:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
