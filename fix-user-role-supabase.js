/**
 * Script to check and fix user role in Supabase database
 * This will show what's in the database and optionally fix it
 */

const { Client } = require('pg');

const USER_EMAIL = 'tshepomtshali89@gmail.com';
const SUPABASE_CONNECTION_STRING = 'postgresql://postgres.pqdxqvxyrahvongbhtdb:Kopenikus0218!@aws-1-eu-west-1.pooler.supabase.com:6543/postgres';

async function checkAndFixUserRole() {
  console.log('🔍 Checking user role in Supabase database...\n');
  
  const client = new Client({
    connectionString: SUPABASE_CONNECTION_STRING,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase database\n');

    // Query current user data
    console.log('📊 Querying current user data...');
    const result = await client.query(
      `SELECT id, email, role, subscription_tier, monthly_call_limit, is_active, created_at
       FROM users 
       WHERE email = $1`,
      [USER_EMAIL]
    );

    if (result.rows.length === 0) {
      console.log('❌ User not found in database');
      return;
    }

    const user = result.rows[0];
    console.log('\n' + '='.repeat(60));
    console.log('📋 CURRENT USER DATA IN SUPABASE:');
    console.log('='.repeat(60));
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role} ${user.role === 'admin' ? '⚠️ PROBLEM!' : '✅'}`);
    console.log(`Subscription Tier: ${user.subscription_tier}`);
    console.log(`Monthly Call Limit: ${user.monthly_call_limit}`);
    console.log(`Is Active: ${user.is_active}`);
    console.log(`Created At: ${user.created_at}`);
    console.log('='.repeat(60) + '\n');

    // Check if role needs fixing
    if (user.role === 'admin' && user.subscription_tier === 'enterprise') {
      console.log('🚨 ISSUE DETECTED:');
      console.log('   User has role="admin" but subscription_tier="enterprise"');
      console.log('   This causes redirect to admin dashboard instead of enterprise dashboard');
      console.log('');
      console.log('💡 RECOMMENDATION:');
      console.log('   Change role from "admin" to "user"');
      console.log('   Keep subscription_tier as "enterprise"');
      console.log('   This will redirect user to /enterprise dashboard\n');
      
      // Uncomment the line below to actually fix it
      // const ACTUALLY_FIX_IT = true;
      const ACTUALLY_FIX_IT = false; // Set to true to apply fix
      
      if (ACTUALLY_FIX_IT) {
        console.log('🔧 Applying fix...');
        await client.query(
          `UPDATE users SET role = 'user' WHERE email = $1`,
          [USER_EMAIL]
        );
        console.log('✅ Updated role from "admin" to "user"\n');
        
        // Query again to confirm
        const confirmResult = await client.query(
          `SELECT email, role, subscription_tier FROM users WHERE email = $1`,
          [USER_EMAIL]
        );
        const updatedUser = confirmResult.rows[0];
        console.log('✅ CONFIRMED UPDATE:');
        console.log(`   Role: ${updatedUser.role}`);
        console.log(`   Subscription: ${updatedUser.subscription_tier}\n`);
      } else {
        console.log('⚠️ DRY RUN MODE - No changes made');
        console.log('   To actually fix it, edit this script and set ACTUALLY_FIX_IT = true\n');
        console.log('📝 SQL Command to fix manually:');
        console.log(`   UPDATE users SET role = 'user' WHERE email = '${USER_EMAIL}';\n`);
      }
    } else if (user.role === 'user') {
      console.log('✅ User role is correct ("user")');
      console.log('   They should be redirected to /enterprise dashboard\n');
    } else {
      console.log(`ℹ️ User has role="${user.role}"`);
      console.log('   This may be intentional\n');
    }

    // Show what the user should see
    console.log('🎯 EXPECTED BEHAVIOR:');
    if (user.subscription_tier === 'enterprise') {
      console.log('   ✅ User should access: /enterprise dashboard');
      console.log('   ✅ User should see: Team Management, API Keys, Campaigns');
      console.log('   ❌ User should NOT see: Admin Panel, User Management, Automations, Backups');
    } else if (user.role === 'admin' || user.role === 'super_admin') {
      console.log('   ✅ User should access: /admin dashboard');
      console.log('   ✅ User should see: All admin features');
    } else {
      console.log('   ✅ User should access: /dashboard (regular user)');
    }
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await client.end();
    console.log('🔒 Database connection closed\n');
  }
}

// Run the check
console.log('\n' + '='.repeat(60));
console.log('🔧 USER ROLE CHECKER AND FIXER');
console.log('='.repeat(60) + '\n');

checkAndFixUserRole()
  .then(() => {
    console.log('✅ Check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  });
