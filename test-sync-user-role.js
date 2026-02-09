const https = require("https");

const API_BASE_URL = "https://api.trevnoctilla.com"; // Update if different

async function syncUserRole(email) {
  return new Promise((resolve, reject) => {
    // First, login to get a token
    const loginData = JSON.stringify({
      email: "admin@trevnoctilla.com",
      password: "admin123",
    });

    const loginOptions = {
      hostname: "api.trevnoctilla.com",
      path: "/auth/login",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": loginData.length,
      },
    };

    console.log("🔐 Logging in...");
    const loginReq = https.request(loginOptions, (loginRes) => {
      let loginBody = "";

      loginRes.on("data", (chunk) => {
        loginBody += chunk;
      });

      loginRes.on("end", () => {
        if (loginRes.statusCode !== 200) {
          console.error("❌ Login failed:", loginBody);
          reject(new Error(`Login failed: ${loginRes.statusCode}`));
          return;
        }

        const loginResult = JSON.parse(loginBody);
        const token = loginResult.access_token;
        const user = loginResult.user;

        console.log("✅ Login successful!");
        console.log(`   User: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Active: ${user.is_active}`);
        console.log();

        // Now sync the user role
        const syncData = email ? JSON.stringify({ email }) : JSON.stringify({});

        const syncOptions = {
          hostname: "api.trevnoctilla.com",
          path: "/api/admin/sync-user-role-from-supabase",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "Content-Length": syncData.length,
          },
        };

        console.log(
          email
            ? `🔄 Syncing user role from Supabase for: ${email}...`
            : "🔄 Syncing all user roles from Supabase..."
        );
        const syncReq = https.request(syncOptions, (syncRes) => {
          let syncBody = "";

          syncRes.on("data", (chunk) => {
            syncBody += chunk;
          });

          syncRes.on("end", () => {
            if (syncRes.statusCode !== 200) {
              console.error("❌ Sync failed:", syncBody);
              reject(new Error(`Sync failed: ${syncRes.statusCode}`));
              return;
            }

            const syncResult = JSON.parse(syncBody);
            console.log("✅ Sync completed!");
            console.log(
              `   Total in Supabase: ${syncResult.total_in_supabase}`
            );
            console.log(`   Already synced: ${syncResult.synced}`);
            console.log(`   Updated: ${syncResult.updated}`);
            console.log(
              `   Not found in backend: ${syncResult.not_found_in_backend}`
            );

            if (syncResult.updates && syncResult.updates.length > 0) {
              console.log("\n📝 Updates made:");
              syncResult.updates.forEach((update) => {
                console.log(`   ${update.email}:`);
                console.log(
                  `     Role: ${update.old_role} -> ${update.new_role}`
                );
                console.log(
                  `     Active: ${update.old_active} -> ${update.new_active}`
                );
              });
            }

            // Now login again to verify the role is correct
            console.log("\n🔐 Logging in again to verify role...");
            const verifyReq = https.request(loginOptions, (verifyRes) => {
              let verifyBody = "";

              verifyRes.on("data", (chunk) => {
                verifyBody += chunk;
              });

              verifyRes.on("end", () => {
                if (verifyRes.statusCode !== 200) {
                  console.error("❌ Verification login failed:", verifyBody);
                  resolve(syncResult);
                  return;
                }

                const verifyResult = JSON.parse(verifyBody);
                const verifiedUser = verifyResult.user;

                console.log("✅ Verification login successful!");
                console.log(`   User: ${verifiedUser.email}`);
                console.log(
                  `   Role: ${verifiedUser.role} ${
                    verifiedUser.role === "super_admin" ? "✅" : "❌"
                  }`
                );
                console.log(`   Active: ${verifiedUser.is_active}`);

                if (verifiedUser.role === "super_admin") {
                  console.log("\n🎉 SUCCESS! User role is now correct!");
                } else {
                  console.log("\n⚠️  WARNING: User role is still incorrect!");
                }

                resolve(syncResult);
              });
            });

            verifyReq.on("error", (error) => {
              console.error("❌ Verification login error:", error);
              resolve(syncResult);
            });

            verifyReq.write(loginData);
            verifyReq.end();
          });
        });

        syncReq.on("error", (error) => {
          console.error("❌ Sync request error:", error);
          reject(error);
        });

        syncReq.write(syncData);
        syncReq.end();
      });
    });

    loginReq.on("error", (error) => {
      console.error("❌ Login request error:", error);
      reject(error);
    });

    loginReq.write(loginData);
    loginReq.end();
  });
}

// Get email from command line argument or use default
const email = process.argv[2] || "admin@trevnoctilla.com";

console.log("=".repeat(80));
console.log("🔄 USER ROLE SYNC FROM SUPABASE");
console.log("=".repeat(80));
console.log();

syncUserRole(email)
  .then(() => {
    console.log("\n✅ Test completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  });
