const { Client } = require("pg");

const SUPABASE_URL =
  "postgresql://postgres.pqdxqvxyrahvongbhtdb:Kopenikus0218!@aws-1-eu-west-1.pooler.supabase.com:6543/postgres";

async function checkSupabaseUsers() {
  const client = new Client({
    connectionString: SUPABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("✅ Connected to Supabase\n");

    const result = await client.query(
      `SELECT id, email, role, is_active, subscription_tier, 
              monthly_call_limit, monthly_used, created_at, last_login
       FROM users
       ORDER BY created_at DESC`
    );

    const allUsers = result.rows;
    console.log(`\n📈 Total users found: ${allUsers.length}\n`);

    // Filter super admin accounts
    const superAdmins = allUsers.filter((user) => user.role === "super_admin");

    // Filter regular admin accounts
    const admins = allUsers.filter((user) => user.role === "admin");

    // Display results
    console.log("=".repeat(80));
    console.log("👑 SUPER ADMIN ACCOUNTS");
    console.log("=".repeat(80));

    if (superAdmins.length === 0) {
      console.log("❌ No super admin accounts found\n");
    } else {
      console.log(`\nFound ${superAdmins.length} super admin account(s):\n`);
      superAdmins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.email}`);
        console.log(`   ID: ${admin.id}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Active: ${admin.is_active ? "✅ Yes" : "❌ No"}`);
        console.log(`   Subscription: ${admin.subscription_tier || "N/A"}`);
        console.log(
          `   Monthly Limit: ${
            admin.monthly_call_limit === -1
              ? "Unlimited"
              : admin.monthly_call_limit || "N/A"
          }`
        );
        console.log(`   Monthly Used: ${admin.monthly_used || 0}`);
        console.log(
          `   Created: ${
            admin.created_at
              ? new Date(admin.created_at).toLocaleString()
              : "N/A"
          }`
        );
        console.log(
          `   Last Login: ${
            admin.last_login
              ? new Date(admin.last_login).toLocaleString()
              : "Never"
          }`
        );
        console.log("");
      });
    }

    console.log("=".repeat(80));
    console.log("🛡️  REGULAR ADMIN ACCOUNTS");
    console.log("=".repeat(80));

    if (admins.length === 0) {
      console.log("❌ No regular admin accounts found\n");
    } else {
      console.log(`\nFound ${admins.length} regular admin account(s):\n`);
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.email}`);
        console.log(`   ID: ${admin.id}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Active: ${admin.is_active ? "✅ Yes" : "❌ No"}`);
        console.log(`   Subscription: ${admin.subscription_tier || "N/A"}`);
        console.log(
          `   Monthly Limit: ${
            admin.monthly_call_limit === -1
              ? "Unlimited"
              : admin.monthly_call_limit || "N/A"
          }`
        );
        console.log(`   Monthly Used: ${admin.monthly_used || 0}`);
        console.log(
          `   Created: ${
            admin.created_at
              ? new Date(admin.created_at).toLocaleString()
              : "N/A"
          }`
        );
        console.log(
          `   Last Login: ${
            admin.last_login
              ? new Date(admin.last_login).toLocaleString()
              : "Never"
          }`
        );
        console.log("");
      });
    }

    // Summary statistics
    console.log("=".repeat(80));
    console.log("📊 SUMMARY STATISTICS");
    console.log("=".repeat(80));
    console.log(`Total Users: ${allUsers.length}`);
    console.log(`Super Admins: ${superAdmins.length}`);
    console.log(`Regular Admins: ${admins.length}`);
    console.log(
      `Regular Users: ${allUsers.length - superAdmins.length - admins.length}`
    );

    // Count by subscription tier
    const tierCounts = {};
    allUsers.forEach((user) => {
      const tier = user.subscription_tier || "free";
      tierCounts[tier] = (tierCounts[tier] || 0) + 1;
    });

    console.log("\n📦 Users by Subscription Tier:");
    Object.entries(tierCounts).forEach(([tier, count]) => {
      console.log(`   ${tier}: ${count}`);
    });

    // Count active vs inactive
    const activeCount = allUsers.filter((u) => u.is_active).length;
    const inactiveCount = allUsers.length - activeCount;
    console.log(`\n✅ Active Users: ${activeCount}`);
    console.log(`❌ Inactive Users: ${inactiveCount}`);

    console.log("\n" + "=".repeat(80));

    return {
      total: allUsers.length,
      superAdmins: superAdmins.length,
      admins: admins.length,
      users: allUsers.length - superAdmins.length - admins.length,
    };
  } catch (error) {
    console.error("\n❌ Error querying Supabase:", error.message);
    console.error(error);
    throw error;
  } finally {
    await client.end();
    console.log("\n🔌 Disconnected from Supabase");
  }
}

// Run the test
checkSupabaseUsers()
  .then((stats) => {
    console.log("\n✅ Test completed successfully!");
    console.log(`\n📊 Final Stats:`);
    console.log(`   Total: ${stats.total}`);
    console.log(`   Super Admins: ${stats.superAdmins}`);
    console.log(`   Admins: ${stats.admins}`);
    console.log(`   Regular Users: ${stats.users}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  });
