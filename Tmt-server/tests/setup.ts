// Load test environment variables before any test runs
process.env.NODE_ENV    = 'test';
process.env.JWT_SECRET  = 'test_jwt_secret_for_jest_do_not_use_in_production';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL ??
  'postgresql://postgres:password@localhost:5432/tmt_test_db?schema=public';
