const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration for testing
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'astro_bsm_portal',
  password: process.env.DB_PASSWORD || 'natiss_natiss',
  port: process.env.DB_PORT || 5432,
  // Optimized connection pool settings
  max: 20,              // Maximum number of clients in the pool
  min: 2,               // Minimum number of clients in the pool
  idleTimeoutMillis: 30000,     // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // Return an error after 5 seconds if connection could not be established
  acquireTimeoutMillis: 60000,   // Return an error after 60 seconds if a connection could not be acquired
  statement_timeout: 30000,      // Abort any statement that takes more than 30 seconds
  query_timeout: 30000,         // Abort any query that takes more than 30 seconds
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// Create connection pool
const pool = new Pool(dbConfig);

// Comprehensive database testing and optimization
class DatabaseOptimizer {
  constructor() {
    this.pool = pool;
    this.testResults = [];
  }

  // Test database connectivity
  async testConnection() {
    console.log('🔄 Testing database connection...');
    try {
      const client = await this.pool.connect();
      const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
      client.release();
      
      console.log('✅ Database connection successful!');
      console.log(`📅 Current time: ${result.rows[0].current_time}`);
      console.log(`🔧 PostgreSQL version: ${result.rows[0].pg_version.split(' ')[0]} ${result.rows[0].pg_version.split(' ')[1]}`);
      
      this.testResults.push({ test: 'Connection', status: 'PASS', details: result.rows[0] });
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      this.testResults.push({ test: 'Connection', status: 'FAIL', error: error.message });
      return false;
    }
  }

  // Test all required tables exist
  async testTables() {
    console.log('\n🔄 Testing table structure...');
    const requiredTables = [
      'customers', 'products', 'orders', 'notifications', 
      'distributors', 'product_images', 'product_videos', 
      'events', 'content_blocks'
    ];

    try {
      const query = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `;
      
      const result = await this.pool.query(query);
      const existingTables = result.rows.map(row => row.table_name);
      
      console.log('📋 Existing tables:', existingTables.join(', '));
      
      const missingTables = requiredTables.filter(table => !existingTables.includes(table));
      
      if (missingTables.length === 0) {
        console.log('✅ All required tables exist!');
        this.testResults.push({ test: 'Tables', status: 'PASS', tables: existingTables });
        return true;
      } else {
        console.log('⚠️ Missing tables:', missingTables.join(', '));
        this.testResults.push({ test: 'Tables', status: 'PARTIAL', missing: missingTables, existing: existingTables });
        return false;
      }
    } catch (error) {
      console.error('❌ Table check failed:', error.message);
      this.testResults.push({ test: 'Tables', status: 'FAIL', error: error.message });
      return false;
    }
  }

  // Test database performance with sample queries
  async testPerformance() {
    console.log('\n🔄 Testing query performance...');
    
    const performanceTests = [
      {
        name: 'Product Search',
        query: `SELECT * FROM products WHERE is_active = true AND in_stock = true ORDER BY sort_order LIMIT 10;`
      },
      {
        name: 'Order Summary',
        query: `SELECT COUNT(*) as total_orders, COUNT(DISTINCT customer_email) as unique_customers FROM orders;`
      },
      {
        name: 'Recent Orders',
        query: `SELECT id, customer_name, status, created_at FROM orders ORDER BY created_at DESC LIMIT 5;`
      },
      {
        name: 'Product Search (Text)',
        query: `SELECT * FROM products WHERE to_tsvector('english', name || ' ' || description) @@ plainto_tsquery('english', 'wound') LIMIT 5;`
      }
    ];

    for (const test of performanceTests) {
      try {
        const startTime = Date.now();
        const result = await this.pool.query(test.query);
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        console.log(`⚡ ${test.name}: ${duration}ms (${result.rowCount} rows)`);
        this.testResults.push({ 
          test: `Performance_${test.name}`, 
          status: duration < 100 ? 'EXCELLENT' : duration < 500 ? 'GOOD' : 'SLOW', 
          duration: duration,
          rows: result.rowCount 
        });
      } catch (error) {
        console.error(`❌ ${test.name} failed:`, error.message);
        this.testResults.push({ test: `Performance_${test.name}`, status: 'FAIL', error: error.message });
      }
    }
  }

  // Test indexes for optimization
  async testIndexes() {
    console.log('\n🔄 Testing database indexes...');
    
    try {
      const query = `
        SELECT 
          schemaname,
          tablename,
          indexname,
          indexdef
        FROM pg_indexes 
        WHERE schemaname = 'public' 
        ORDER BY tablename, indexname;
      `;
      
      const result = await this.pool.query(query);
      const indexes = result.rows;
      
      console.log(`📊 Found ${indexes.length} indexes:`);
      
      const indexSummary = {};
      indexes.forEach(idx => {
        if (!indexSummary[idx.tablename]) {
          indexSummary[idx.tablename] = [];
        }
        indexSummary[idx.tablename].push(idx.indexname);
      });
      
      Object.keys(indexSummary).forEach(table => {
        console.log(`  ${table}: ${indexSummary[table].length} indexes`);
      });
      
      this.testResults.push({ test: 'Indexes', status: 'PASS', summary: indexSummary, total: indexes.length });
      return true;
    } catch (error) {
      console.error('❌ Index check failed:', error.message);
      this.testResults.push({ test: 'Indexes', status: 'FAIL', error: error.message });
      return false;
    }
  }

  // Test connection pool health
  async testConnectionPool() {
    console.log('\n🔄 Testing connection pool...');
    
    try {
      const poolInfo = {
        totalConnections: this.pool.totalCount,
        idleConnections: this.pool.idleCount,
        waitingClients: this.pool.waitingCount
      };
      
      console.log('🏊 Connection Pool Status:');
      console.log(`  Total connections: ${poolInfo.totalConnections}`);
      console.log(`  Idle connections: ${poolInfo.idleConnections}`);
      console.log(`  Waiting clients: ${poolInfo.waitingClients}`);
      
      // Test multiple concurrent connections
      const concurrentQueries = Array.from({ length: 5 }, (_, i) => 
        this.pool.query('SELECT $1 as test_id, NOW() as timestamp', [i])
      );
      
      const startTime = Date.now();
      const results = await Promise.all(concurrentQueries);
      const duration = Date.now() - startTime;
      
      console.log(`⚡ Concurrent queries (5): ${duration}ms`);
      
      this.testResults.push({ 
        test: 'ConnectionPool', 
        status: 'PASS', 
        poolInfo: poolInfo,
        concurrentTestDuration: duration 
      });
      return true;
    } catch (error) {
      console.error('❌ Connection pool test failed:', error.message);
      this.testResults.push({ test: 'ConnectionPool', status: 'FAIL', error: error.message });
      return false;
    }
  }

  // Test data integrity
  async testDataIntegrity() {
    console.log('\n🔄 Testing data integrity...');
    
    const integrityTests = [
      {
        name: 'Customer Email Uniqueness',
        query: `SELECT email, COUNT(*) as count FROM customers GROUP BY email HAVING COUNT(*) > 1;`
      },
      {
        name: 'Product UUID Uniqueness',
        query: `SELECT uuid, COUNT(*) as count FROM products GROUP BY uuid HAVING COUNT(*) > 1;`
      },
      {
        name: 'Order JSON Validation',
        query: `SELECT id FROM orders WHERE NOT (products IS NOT NULL AND jsonb_typeof(products) = 'array');`
      },
      {
        name: 'Foreign Key Integrity',
        query: `SELECT COUNT(*) as orphaned_orders FROM orders o LEFT JOIN customers c ON o.customer_id = c.id WHERE o.customer_id IS NOT NULL AND c.id IS NULL;`
      }
    ];

    for (const test of integrityTests) {
      try {
        const result = await this.pool.query(test.query);
        const hasIssues = result.rowCount > 0;
        
        if (hasIssues) {
          console.log(`⚠️ ${test.name}: Found ${result.rowCount} integrity issues`);
          this.testResults.push({ test: `Integrity_${test.name}`, status: 'WARN', issues: result.rowCount });
        } else {
          console.log(`✅ ${test.name}: Clean`);
          this.testResults.push({ test: `Integrity_${test.name}`, status: 'PASS' });
        }
      } catch (error) {
        console.error(`❌ ${test.name} failed:`, error.message);
        this.testResults.push({ test: `Integrity_${test.name}`, status: 'FAIL', error: error.message });
      }
    }
  }

  // Run migration script
  async runMigration() {
    console.log('\n🔄 Running database migration...');
    
    try {
      const migrationPath = path.join(__dirname, 'migrate-to-optimized.sql');
      
      if (fs.existsSync(migrationPath)) {
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        await this.pool.query(migrationSQL);
        console.log('✅ Migration completed successfully!');
        this.testResults.push({ test: 'Migration', status: 'PASS' });
        return true;
      } else {
        console.log('⚠️ Migration file not found, skipping...');
        this.testResults.push({ test: 'Migration', status: 'SKIP', reason: 'File not found' });
        return false;
      }
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      this.testResults.push({ test: 'Migration', status: 'FAIL', error: error.message });
      return false;
    }
  }

  // Generate optimization recommendations
  generateRecommendations() {
    console.log('\n📊 OPTIMIZATION RECOMMENDATIONS:');
    
    const recommendations = [];
    
    // Check performance results
    const slowQueries = this.testResults.filter(r => 
      r.test.startsWith('Performance_') && (r.status === 'SLOW' || r.duration > 500)
    );
    
    if (slowQueries.length > 0) {
      recommendations.push('⚡ Consider adding more indexes for slow queries');
      recommendations.push('🔧 Review query patterns and optimize WHERE clauses');
    }
    
    // Check connection pool
    const poolTest = this.testResults.find(r => r.test === 'ConnectionPool');
    if (poolTest && poolTest.concurrentTestDuration > 1000) {
      recommendations.push('🏊 Consider increasing connection pool size');
    }
    
    // Check missing tables
    const tableTest = this.testResults.find(r => r.test === 'Tables');
    if (tableTest && tableTest.status === 'PARTIAL') {
      recommendations.push('📋 Run migration script to create missing tables');
    }
    
    // Check integrity issues
    const integrityIssues = this.testResults.filter(r => 
      r.test.startsWith('Integrity_') && r.status === 'WARN'
    );
    
    if (integrityIssues.length > 0) {
      recommendations.push('🔍 Address data integrity issues found');
    }
    
    if (recommendations.length === 0) {
      console.log('✅ Database is well optimized! No major issues found.');
    } else {
      recommendations.forEach(rec => console.log(rec));
    }
    
    return recommendations;
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting comprehensive database optimization test...\n');
    
    const tests = [
      this.testConnection,
      this.testTables,
      this.testIndexes,
      this.testConnectionPool,
      this.testPerformance,
      this.testDataIntegrity
    ];
    
    for (const test of tests) {
      await test.call(this);
    }
    
    this.generateRecommendations();
    
    console.log('\n📈 TEST SUMMARY:');
    const passed = this.testResults.filter(r => r.status === 'PASS' || r.status === 'EXCELLENT' || r.status === 'GOOD').length;
    const total = this.testResults.length;
    
    console.log(`✅ ${passed}/${total} tests passed`);
    console.log('🔄 Database optimization complete!\n');
    
    return this.testResults;
  }

  // Close connection pool
  async close() {
    await this.pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  (async () => {
    const optimizer = new DatabaseOptimizer();
    
    try {
      await optimizer.runAllTests();
      
      // Optional: Run migration if needed
      const runMigration = process.argv.includes('--migrate');
      if (runMigration) {
        await optimizer.runMigration();
      }
      
    } catch (error) {
      console.error('❌ Database optimization failed:', error);
    } finally {
      await optimizer.close();
      process.exit(0);
    }
  })();
}

module.exports = DatabaseOptimizer;
