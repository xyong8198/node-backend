const app = require('./app');
const { sequelize, testConnection } = require('./config/database');

const PORT = process.env.PORT || 3000;

// Database connection and server startup
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Sync database models (create tables if they don't exist)
    await sequelize.sync({ 
      force: false, // Set to true to drop and recreate tables (DANGEROUS in production)
      alter: process.env.NODE_ENV === 'development' // Auto-alter tables in development
    });
    
    console.log('📊 Database synchronized successfully');
    
    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/`);
      console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
    });
    
    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
      
      server.close(async () => {
        console.log('🔒 HTTP server closed');
        
        try {
          await sequelize.close();
          console.log('🔌 Database connection closed');
        } catch (error) {
          console.error('❌ Error closing database connection:', error);
        }
        
        console.log('✅ Graceful shutdown completed');
        process.exit(0);
      });
    };
    
    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('💥 Uncaught Exception:', error);
      process.exit(1);
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();
