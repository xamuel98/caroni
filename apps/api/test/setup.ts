// Keep unit/e2e runs hermetic: no real database, deterministic env.
delete process.env.DATABASE_URL;
process.env.NODE_ENV = 'test';
