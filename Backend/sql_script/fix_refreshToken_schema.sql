-- Fix token tables schema to allow NULL for voterID or candidateID
-- Since users are either voters OR candidates (not both), one ID should be nullable
-- This affects: refreshToken, resetPasswordToken, emailVerificationToken

-- ============================================
-- Fix refreshToken table
-- ============================================
ALTER TABLE "refreshToken" 
  DROP CONSTRAINT IF EXISTS refreshToken_voterID_fkey,
  DROP CONSTRAINT IF EXISTS refreshToken_candidateID_fkey;

ALTER TABLE "refreshToken" 
  ALTER COLUMN "voterID" DROP NOT NULL,
  ALTER COLUMN "candidateID" DROP NOT NULL;

ALTER TABLE "refreshToken"
  ADD CONSTRAINT refreshToken_voterID_fkey 
    FOREIGN KEY ("voterID") REFERENCES "voter"("VoterID") ON DELETE CASCADE,
  ADD CONSTRAINT refreshToken_candidateID_fkey 
    FOREIGN KEY ("candidateID") REFERENCES "candidate"("CandidateID") ON DELETE CASCADE;

ALTER TABLE "refreshToken"
  ADD CONSTRAINT refreshToken_one_id_required 
    CHECK (
      ("voterID" IS NOT NULL AND "candidateID" IS NULL) OR 
      ("voterID" IS NULL AND "candidateID" IS NOT NULL)
    );

-- ============================================
-- Fix resetPasswordToken table
-- ============================================
ALTER TABLE "resetPasswordToken" 
  DROP CONSTRAINT IF EXISTS resetPasswordToken_voterID_fkey,
  DROP CONSTRAINT IF EXISTS resetPasswordToken_candidateID_fkey;

ALTER TABLE "resetPasswordToken" 
  ALTER COLUMN "voterID" DROP NOT NULL,
  ALTER COLUMN "candidateID" DROP NOT NULL;

ALTER TABLE "resetPasswordToken"
  ADD CONSTRAINT resetPasswordToken_voterID_fkey 
    FOREIGN KEY ("voterID") REFERENCES "voter"("VoterID") ON DELETE CASCADE,
  ADD CONSTRAINT resetPasswordToken_candidateID_fkey 
    FOREIGN KEY ("candidateID") REFERENCES "candidate"("CandidateID") ON DELETE CASCADE;

ALTER TABLE "resetPasswordToken"
  ADD CONSTRAINT resetPasswordToken_one_id_required 
    CHECK (
      ("voterID" IS NOT NULL AND "candidateID" IS NULL) OR 
      ("voterID" IS NULL AND "candidateID" IS NOT NULL)
    );

-- ============================================
-- Fix emailVerificationToken table
-- ============================================
ALTER TABLE "emailVerificationToken" 
  DROP CONSTRAINT IF EXISTS emailVerificationToken_voterID_fkey,
  DROP CONSTRAINT IF EXISTS emailVerificationToken_candidateID_fkey;

ALTER TABLE "emailVerificationToken" 
  ALTER COLUMN "voterID" DROP NOT NULL,
  ALTER COLUMN "candidateID" DROP NOT NULL;

ALTER TABLE "emailVerificationToken"
  ADD CONSTRAINT emailVerificationToken_voterID_fkey 
    FOREIGN KEY ("voterID") REFERENCES "voter"("VoterID") ON DELETE CASCADE,
  ADD CONSTRAINT emailVerificationToken_candidateID_fkey 
    FOREIGN KEY ("candidateID") REFERENCES "candidate"("CandidateID") ON DELETE CASCADE;

ALTER TABLE "emailVerificationToken"
  ADD CONSTRAINT emailVerificationToken_one_id_required 
    CHECK (
      ("voterID" IS NOT NULL AND "candidateID" IS NULL) OR 
      ("voterID" IS NULL AND "candidateID" IS NOT NULL)
    );

-- ============================================
-- Add comments explaining the design
-- ============================================
COMMENT ON TABLE "refreshToken" IS 'Refresh tokens for authentication. Each token is associated with either a voter OR a candidate, not both.';
COMMENT ON TABLE "resetPasswordToken" IS 'Password reset tokens. Each token is associated with either a voter OR a candidate, not both.';
COMMENT ON TABLE "emailVerificationToken" IS 'Email verification tokens. Each token is associated with either a voter OR a candidate, not both.';

