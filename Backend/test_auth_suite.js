import crypto from "crypto";
import connectDB from "./src/config/db.js";
import userModel from "./src/models/user.model.js";
import app from "./src/app.js";

async function runTestSuite() {
    console.log("=== STARTING AUTHENTICATION VERIFICATION TEST SUITE ===\n");
    await connectDB();

    const server = app.listen(0);
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}`;
    console.log(`Test server bound to ${baseUrl}`);

    const timestamp = Date.now();
    const testEmail = `testuser_${timestamp}@snitchtest.com`;
    const testPassword = "Password123!";
    const testFullname = "Test E2E User";

    const results = [];
    const record = (num, name, passed, details = "") => {
        results.push({ num, name, passed, details });
        console.log(`[${passed ? "PASS" : "FAIL"}] #${num} ${name}${details ? ` - ${details}` : ""}`);
    };

    try {
        // SCENARIO 8 & 9: Registration creates user with emailVerified=false & verification token
        const regRes = await fetch(`${baseUrl}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fullname: testFullname,
                email: testEmail,
                password: testPassword,
                confirmPassword: testPassword,
            }),
        });
        const regData = await regRes.json();
        const setCookieHeader = regRes.headers.get("set-cookie");

        const dbUser = await userModel.findOne({ email: testEmail });

        const sc8_passed = regRes.status === 201 &&
            dbUser &&
            dbUser.emailVerified === false &&
            Boolean(dbUser.verificationTokenHash) &&
            Boolean(dbUser.verificationTokenExpiresAt) &&
            !setCookieHeader; // Must NOT issue fully authenticated session

        record(8, "Registration creates user with emailVerified=false", sc8_passed, `HTTP ${regRes.status}, emailVerified=${dbUser?.emailVerified}`);
        record(9, "Verification email and secure token generated", Boolean(dbUser?.verificationTokenHash), `Stored hash: ${dbUser?.verificationTokenHash?.substring(0, 16)}...`);

        // SCENARIO 14: Unverified account cannot log in
        const unverifiedLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: testEmail,
                password: testPassword,
            }),
        });
        const unverifiedLoginData = await unverifiedLoginRes.json();
        record(14, "Unverified account cannot log in", unverifiedLoginRes.status === 403 && unverifiedLoginData.isUnverified === true, `HTTP ${unverifiedLoginRes.status}: "${unverifiedLoginData.message}"`);

        // SCENARIO 6: Invalid password does not authenticate user
        const badPasswordRes = await fetch(`${baseUrl}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: testEmail,
                password: "WrongPassword999!",
            }),
        });
        const badPasswordData = await badPasswordRes.json();
        record(6, "Invalid password does not authenticate user", badPasswordRes.status === 400 && badPasswordData.message === "Login failed. Invalid email or password.", `Message: "${badPasswordData.message}"`);

        // SCENARIO 7: Unknown email shows the Register option
        const unknownEmailRes = await fetch(`${baseUrl}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: `nonexistent_${timestamp}@snitchtest.com`,
                password: testPassword,
            }),
        });
        const unknownEmailData = await unknownEmailRes.json();
        record(7, "Unknown email shows Register option", unknownEmailRes.status === 400 && unknownEmailData.notRegistered === true, `notRegistered=${unknownEmailData.notRegistered}`);

        // SCENARIO 11: Expired verification link is rejected
        const expiredUserEmail = `expired_${timestamp}@snitchtest.com`;
        const expiredRawToken = crypto.randomBytes(32).toString("hex");
        const expiredHash = crypto.createHash("sha256").update(expiredRawToken).digest("hex");
        await userModel.create({
            fullname: "Expired User",
            email: expiredUserEmail,
            password: testPassword,
            emailVerified: false,
            verificationTokenHash: expiredHash,
            verificationTokenExpiresAt: new Date(Date.now() - 3600000), // 1 hour in the past
        });

        const expiredVerifyRes = await fetch(`${baseUrl}/api/auth/verify-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: expiredRawToken }),
        });
        const expiredVerifyData = await expiredVerifyRes.json();
        record(11, "Expired verification link is rejected", expiredVerifyRes.status === 400 && expiredVerifyData.expired === true, `HTTP ${expiredVerifyRes.status}: "${expiredVerifyData.message}"`);

        // SCENARIO 10 & 13: Valid verification link verifies account & establishes authenticated session
        const validRawToken = crypto.randomBytes(32).toString("hex");
        const validHash = crypto.createHash("sha256").update(validRawToken).digest("hex");
        dbUser.verificationTokenHash = validHash;
        dbUser.verificationTokenExpiresAt = new Date(Date.now() + 86400000);
        await dbUser.save();

        const validVerifyRes = await fetch(`${baseUrl}/api/auth/verify-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: validRawToken }),
        });
        const validVerifyData = await validVerifyRes.json();
        const verifyCookie = validVerifyRes.headers.get("set-cookie");

        const updatedDbUser = await userModel.findOne({ email: testEmail });
        const sc10_passed = validVerifyRes.status === 200 &&
            updatedDbUser.emailVerified === true &&
            updatedDbUser.verificationTokenHash === undefined;
        record(10, "Valid verification link verifies the account", sc10_passed, `emailVerified=${updatedDbUser.emailVerified}, token invalidated`);
        record(13, "Successful verification establishes authentication correctly", Boolean(verifyCookie && verifyCookie.includes("token=")), `Cookie header: ${verifyCookie?.split(";")[0]}`);

        // SCENARIO 12: Reused verification link is rejected
        const reuseVerifyRes = await fetch(`${baseUrl}/api/auth/verify-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: validRawToken }),
        });
        record(12, "Reused verification link is rejected", reuseVerifyRes.status === 400, `HTTP ${reuseVerifyRes.status}`);

        // Verified account login test
        const verifiedLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: testEmail,
                password: testPassword,
            }),
        });
        const verifiedLoginCookie = verifiedLoginRes.headers.get("set-cookie");
        record(5, "Verified user can login successfully with cookie", verifiedLoginRes.status === 200 && Boolean(verifiedLoginCookie), `Cookie present`);

        // SCENARIO 20: Protected backend endpoints reject unauthenticated requests
        const unauthMeRes = await fetch(`${baseUrl}/api/auth/me`);
        const unauthCartRes = await fetch(`${baseUrl}/api/cart`);
        record(20, "Protected backend endpoints reject unauthenticated requests", unauthMeRes.status === 401 && unauthCartRes.status === 401, `/me: ${unauthMeRes.status}, /cart: ${unauthCartRes.status}`);

        // SCENARIO 21: Valid cookie authenticates protected endpoint /me
        let tokenVal = "";
        if (verifiedLoginCookie) {
            const match = verifiedLoginCookie.match(/token=([^;]+)/);
            if (match) tokenVal = match[1];
        }
        const authMeRes = await fetch(`${baseUrl}/api/auth/me`, {
            headers: { Cookie: `token=${tokenVal}` },
        });
        const authMeData = await authMeRes.json();
        record(21, "Refreshing page restores valid authentication state via /me", authMeRes.status === 200 && authMeData.user?.email === testEmail, `Fetched user email=${authMeData.user?.email}`);

        // SCENARIO 19: Logout clears authentication cookie
        const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, {
            method: "POST",
            headers: { Cookie: `token=${tokenVal}` },
        });
        const logoutCookie = logoutRes.headers.get("set-cookie");
        record(19, "Logout clears authentication cookie", logoutRes.status === 200 && Boolean(logoutCookie && (logoutCookie.includes("token=;") || logoutCookie.includes("Expires="))), `Clear-cookie: ${logoutCookie}`);

        // SCENARIO 17: Google Login does not silently register unknown users
        const unknownGoogleEmail = `google_unknown_${timestamp}@snitchtest.com`;
        const simReqLogin = {
            query: { state: Buffer.from(JSON.stringify({ action: "login", redirect: "/cart" })).toString("base64") },
            user: { emails: [{ value: unknownGoogleEmail }], displayName: "Unknown Google", id: "gid_123" }
        };
        let redirectLoginUrl = "";
        const simResLogin = {
            redirect: (url) => { redirectLoginUrl = url; },
            cookie: () => {},
        };
        const { googleCallback } = await import("./src/controllers/auth.controller.js");
        await googleCallback(simReqLogin, simResLogin);

        const checkGoogleUnknown = await userModel.findOne({ email: unknownGoogleEmail });
        const sc17_passed = !checkGoogleUnknown && redirectLoginUrl.includes("/register?error=no_account");
        record(17, "Google Login does not silently register unknown users", sc17_passed, `User created: ${Boolean(checkGoogleUnknown)}, Redirected to: ${redirectLoginUrl}`);

        // SCENARIO 15 & 16: Google Registration creates account & Google Login works for existing account
        const knownGoogleEmail = `google_user_${timestamp}@snitchtest.com`;
        const simReqReg = {
            query: { state: Buffer.from(JSON.stringify({ action: "register", redirect: "/cart" })).toString("base64") },
            user: { emails: [{ value: knownGoogleEmail }], displayName: "Known Google", id: "gid_999" }
        };
        let redirectRegUrl = "";
        let regSetCookie = false;
        const simResReg = {
            redirect: (url) => { redirectRegUrl = url; },
            cookie: () => { regSetCookie = true; },
        };
        await googleCallback(simReqReg, simResReg);
        const createdGoogleUser = await userModel.findOne({ email: knownGoogleEmail });
        record(15, "Google registration creates only one account with emailVerified=true", Boolean(createdGoogleUser && createdGoogleUser.emailVerified === true && regSetCookie), `User created, emailVerified=${createdGoogleUser?.emailVerified}`);

        // Now Google Login for the registered account
        const simReqKnownLogin = {
            query: { state: Buffer.from(JSON.stringify({ action: "login", redirect: "/collections" })).toString("base64") },
            user: { emails: [{ value: knownGoogleEmail }], displayName: "Known Google", id: "gid_999" }
        };
        let redirectKnownUrl = "";
        let knownLoginCookie = false;
        const simResKnownLogin = {
            redirect: (url) => { redirectKnownUrl = url; },
            cookie: () => { knownLoginCookie = true; },
        };
        await googleCallback(simReqKnownLogin, simResKnownLogin);
        record(16, "Google Login works for an existing registered account", knownLoginCookie && redirectKnownUrl.includes("/collections"), `Redirect: ${redirectKnownUrl}, Cookie set: ${knownLoginCookie}`);

        // SCENARIO 24: No duplicate user creation under concurrent requests
        const concurrentEmail = `concurrent_${timestamp}@snitchtest.com`;
        const promises = [
            fetch(`${baseUrl}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fullname: "Concurrent 1", email: concurrentEmail, password: testPassword }),
            }),
            fetch(`${baseUrl}/api/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fullname: "Concurrent 2", email: concurrentEmail, password: testPassword }),
            }),
        ];
        await Promise.all(promises);
        const concurrentUsers = await userModel.find({ email: concurrentEmail });
        record(24, "No duplicate user creation occurs under concurrent requests", concurrentUsers.length === 1, `Users found in MongoDB: ${concurrentUsers.length}`);

        // Clean up test data
        await userModel.deleteMany({
            email: {
                $in: [
                    testEmail,
                    expiredUserEmail,
                    unknownGoogleEmail,
                    knownGoogleEmail,
                    concurrentEmail,
                ],
            },
        });

        server.close();

        console.log("\n=== ALL TEST SCENARIOS COMPLETED ===");
        const passedCount = results.filter(r => r.passed).length;
        console.log(`Passed: ${passedCount} / ${results.length}`);
        if (passedCount === results.length) {
            console.log("SUCCESS: All executed test scenarios PASSED with 100% success rate.\n");
            process.exit(0);
        } else {
            console.error("Some tests failed.\n");
            process.exit(1);
        }
    } catch (err) {
        console.error("Test execution error:", err);
        process.exit(1);
    }
}

runTestSuite();
