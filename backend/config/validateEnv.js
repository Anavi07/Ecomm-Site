/**
 * Environment Variable Validation
 * Validates required environment variables for production deployment
 */

function validateEnvironment() {
  const requiredVars = [];
  const warnings = [];

  // Required in production
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.MONGODB_URI) {
      requiredVars.push('MONGODB_URI');
    }
    if (!process.env.JWT_SECRET) {
      requiredVars.push('JWT_SECRET');
    }
    if (!process.env.SESSION_SECRET) {
      requiredVars.push('SESSION_SECRET');
    }
    if (!process.env.COOKIE_SECRET) {
      requiredVars.push('COOKIE_SECRET');
    }
    if (!process.env.FRONTEND_URL) {
      warnings.push('FRONTEND_URL (recommended for CORS configuration)');
    }
  }

  // Warnings for development
  if (process.env.NODE_ENV !== 'production') {
    if (!process.env.MONGODB_URI) {
      warnings.push('MONGODB_URI (required for database connection)');
    }
  }

  // Display errors
  if (requiredVars.length > 0) {
    console.error('\n❌ ERROR: Missing required environment variables in production:');
    requiredVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\n💡 Please set these variables before starting the server.\n');
    process.exit(1);
  }

  // Display warnings
  if (warnings.length > 0) {
    console.warn('\n⚠️  WARNING: Missing recommended environment variables:');
    warnings.forEach(varName => {
      console.warn(`   - ${varName}`);
    });
    console.warn('');
  }

  // Success message
  if (process.env.NODE_ENV === 'production') {
    console.log('✅ All required environment variables are set for production.\n');
  }
}

module.exports = validateEnvironment;

