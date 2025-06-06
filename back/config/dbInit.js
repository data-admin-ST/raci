const db = require('./db');

/**
 * Initialize the database schema
 */
const initializeDatabase = async () => {
  try {
    console.log('Initializing database schema...');

    // Create website_admins table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS website_admins (
        admin_id SERIAL PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create companies table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS companies (
        company_id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        logo_url TEXT,
        domain TEXT,
        industry TEXT,
        size TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create users table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone TEXT,
        designation TEXT,
        employee_id TEXT,
        role TEXT CHECK (role IN ('company_admin', 'hod', 'user')),
        company_id INT REFERENCES companies(company_id) ON DELETE CASCADE,
        department_id INT,
        approval_assign BOOLEAN DEFAULT FALSE,
        is_default_password BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create departments table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS departments (
        department_id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        hod_id INT REFERENCES users(user_id) ON DELETE SET NULL,
        company_id INT REFERENCES companies(company_id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add foreign key constraint to users.department_id
    await db.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'users_department_id_fkey'
        ) THEN
          ALTER TABLE users
          ADD CONSTRAINT users_department_id_fkey
          FOREIGN KEY (department_id)
          REFERENCES departments(department_id)
          ON DELETE SET NULL;
        END IF;
      END $$;
    `);

    // Create events table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS events (
        event_id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        department_id INT REFERENCES departments(department_id) ON DELETE CASCADE,
        hod_id INT REFERENCES users(user_id) ON DELETE SET NULL,
        created_by INT REFERENCES users(user_id) ON DELETE SET NULL,
        document_path TEXT,
        approval_status TEXT CHECK (approval_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
        rejection_reason TEXT,
        approved_by INT REFERENCES users(user_id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create RACI assignments table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS raci_assignments (
        raci_id SERIAL PRIMARY KEY,
        event_id INT REFERENCES events(event_id) ON DELETE CASCADE,
        type TEXT CHECK (type IN ('R', 'A', 'C', 'I')),
        user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
        financial_limit_min NUMERIC,
        financial_limit_max NUMERIC,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create RACI approval table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS raci_approvals (
        approval_id SERIAL PRIMARY KEY,
        raci_id INT REFERENCES raci_assignments(raci_id) ON DELETE CASCADE,
        approval_level INT NOT NULL,
        status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
        reason TEXT,
        approved_by INT REFERENCES users(user_id) ON DELETE SET NULL,
        approved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create RACI meeting calendar table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS raci_meetings (
        meeting_id SERIAL PRIMARY KEY,
        event_id INT REFERENCES events(event_id) ON DELETE CASCADE,
        meeting_date TIMESTAMP,
        title TEXT,
        description TEXT,
        guest_user_ids TEXT,
        meeting_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create event tracker table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS event_trackers (
        tracker_id SERIAL PRIMARY KEY,
        event_id INT REFERENCES events(event_id) ON DELETE CASCADE,
        user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database schema initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database schema:', error);
    throw error;
  }
};

module.exports = {
  initializeDatabase
};
