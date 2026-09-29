import pool from "../config/db.js";
import bcrypt from "bcrypt";
import { ensureDatabaseViews } from "../config/initViews.js";

const seed = async () => {
  console.log("🌱 Starting Online Voting System database seed...");

  try {
    // 1. Ensure views exist first
    console.log("1. Ensuring database views exist...");
    await ensureDatabaseViews();

    // 2. Seed Election Types
    console.log("2. Checking election types...");
    const electionTypes = [
      ["Presidential", "National presidential election"],
      ["Parliamentary", "Parliamentary or legislative election"],
      ["Local Government", "Municipal or local government election"],
      ["Referendum", "Public referendum or ballot initiative"],
      ["Primary", "Primary election for party candidates"],
    ];

    for (const [name, desc] of electionTypes) {
      await pool.query(
        `INSERT INTO ElectionType (TypeName, Description)
         VALUES ($1, $2)
         ON CONFLICT (TypeName) DO NOTHING`,
        [name, desc]
      );
    }
    console.log("✅ Election types ready.");

    // 3. Seed Default Admin
    console.log("3. Checking admin account...");
    const defaultPasswordHash = await bcrypt.hash("adminpass", 10);
    const adminResult = await pool.query(
      `INSERT INTO Admin (Username, Password)
       VALUES ($1, $2)
       ON CONFLICT (Username) DO UPDATE SET Username = EXCLUDED.Username
       RETURNING AdminID`,
      ["admin", defaultPasswordHash]
    );

    let adminId = adminResult.rows[0]?.adminid || adminResult.rows[0]?.AdminID;
    if (!adminId) {
      const existingAdmin = await pool.query("SELECT AdminID FROM Admin WHERE Username = $1", ["admin"]);
      adminId = existingAdmin.rows[0]?.adminid || existingAdmin.rows[0]?.AdminID || 1;
    }
    console.log(`✅ Admin account ready (AdminID: ${adminId}).`);

    // 4. Seed Active Elections
    console.log("4. Checking active elections...");
    const existingActiveElections = await pool.query(
      "SELECT ElectionID, ElectionName, IsActive FROM Election WHERE IsActive = TRUE"
    );

    let presElectionId;
    let localElectionId;

    if (existingActiveElections.rows.length === 0) {
      console.log("No active elections found. Inserting sample active elections...");

      const presElection = await pool.query(
        `INSERT INTO Election (ElectionTypeID, ElectionName, AdminID, StartDate, EndDate, IsActive, Description)
         VALUES ($1, $2, $3, NOW() - INTERVAL '1 day', NOW() + INTERVAL '30 days', TRUE, $4)
         RETURNING ElectionID`,
        [1, "2024/2025 National Presidential Election", adminId, "National democratic election for head of state."]
      );
      presElectionId = presElection.rows[0]?.electionid || presElection.rows[0]?.ElectionID;

      const localElection = await pool.query(
        `INSERT INTO Election (ElectionTypeID, ElectionName, AdminID, StartDate, EndDate, IsActive, Description)
         VALUES ($1, $2, $3, NOW() - INTERVAL '2 days', NOW() + INTERVAL '60 days', TRUE, $4)
         RETURNING ElectionID`,
        [3, "Municipal Local Government Election", adminId, "Provincial and local council election."]
      );
      localElectionId = localElection.rows[0]?.electionid || localElection.rows[0]?.ElectionID;

      console.log(`✅ Created active elections: ID ${presElectionId} and ID ${localElectionId}`);
    } else {
      console.log(`ℹ️ Found ${existingActiveElections.rows.length} existing active election(s).`);
      presElectionId = existingActiveElections.rows[0]?.electionid || existingActiveElections.rows[0]?.ElectionID;
      localElectionId = existingActiveElections.rows[1]?.electionid || existingActiveElections.rows[1]?.ElectionID || presElectionId;
    }

    // 5. Seed Candidates
    console.log("5. Checking candidates...");
    const candidatesCount = await pool.query("SELECT COUNT(*)::int FROM Candidate");
    if (candidatesCount.rows[0].count === 0 && presElectionId) {
      console.log("Seeding sample candidates...");
      const candidatePasswordHash = await bcrypt.hash("candidatepass", 10);

      const sampleCandidates = [
        ["David", "Miller", "8001011234567", "david.miller@candidate.com", candidatePasswordHash, "President", "Experienced leader with 20 years in community and public service.", true, presElectionId],
        ["Sarah", "Johnson", "8202029876543", "sarah.johnson@candidate.com", candidatePasswordHash, "President", "Advocate for youth education, tech development, and healthcare reform.", true, presElectionId],
        ["Michael", "Davis", "8403034567891", "michael.davis@candidate.com", candidatePasswordHash, "Council Representative", "Local business entrepreneur dedicated to local economic development.", true, localElectionId],
        ["Emma", "Wilson", "8604041112223", "emma.wilson@candidate.com", candidatePasswordHash, "Council Representative", "Community organizer fighting for transparent governance.", true, localElectionId],
      ];

      for (const [first, last, idnum, email, pass, pos, bio, ver, elecId] of sampleCandidates) {
        await pool.query(
          `INSERT INTO Candidate (FirstName, LastName, IdNumber, Email, Password, Position, Biography, IsVerified, ElectionID)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (Email) DO NOTHING`,
          [first, last, idnum, email, pass, pos, bio, ver, elecId]
        );
      }
      console.log("✅ Sample candidates seeded.");
    } else {
      console.log(`ℹ️ Candidates table already has ${candidatesCount.rows[0].count} records.`);
    }

    // 6. Seed Sample Voters
    console.log("6. Checking voters...");
    const votersCount = await pool.query("SELECT COUNT(*)::int FROM Voter");
    if (votersCount.rows[0].count === 0) {
      console.log("Seeding sample voters...");
      const voterPasswordHash = await bcrypt.hash("voterpass", 10);

      const sampleVoters = [
        ["John", "Doe", "john.doe@example.com", "9001011234567", voterPasswordHash, "1990-01-01", "+27123456789", true],
        ["Jane", "Smith", "jane.smith@example.com", "8505159876543", voterPasswordHash, "1985-05-15", "+27987654321", true],
        ["Bob", "Johnson", "bob.johnson@example.com", "9210204567891", voterPasswordHash, "1992-10-20", "+27112233445", true],
      ];

      for (const [first, last, email, idnum, pass, dob, phone, ver] of sampleVoters) {
        await pool.query(
          `INSERT INTO Voter (FirstName, LastName, Email, IdNumber, Password, DateOfBirth, PhoneNumber, IsVerified)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (Email) DO NOTHING`,
          [first, last, email, idnum, pass, dob, phone, ver]
        );
      }
      console.log("✅ Sample voters seeded.");
    } else {
      console.log(`ℹ️ Voter table already has ${votersCount.rows[0].count} records.`);
    }

    console.log("\n🎉 Database seed finished successfully!");
    console.log("-----------------------------------------");
    console.log("Admin credentials:    admin / adminpass");
    console.log("Sample voter:         john.doe@example.com / voterpass");
    console.log("Sample candidate:     david.miller@candidate.com / candidatepass");
    console.log("-----------------------------------------\n");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
};

seed();
