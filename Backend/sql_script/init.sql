-- Active: 1739611791945@@127.0.0.1@5432@OnlineVotingSystem
DROP TABLE IF EXISTS VoterAuditLog CASCADE;
DROP TABLE IF EXISTS AdminAuditLog CASCADE;
DROP TABLE IF EXISTS Vote CASCADE;
DROP TABLE IF EXISTS Candidate CASCADE;
DROP TABLE IF EXISTS Election CASCADE;
DROP TABLE IF EXISTS ElectionType CASCADE;
DROP TABLE IF EXISTS Voter CASCADE;
DROP TABLE IF EXISTS Address CASCADE;
DROP TABLE IF EXISTS Admin CASCADE;

DROP TABLE IF EXISTS refreshToken CASCADE;
CREATE TABLE Address (
    AddressID SERIAL PRIMARY KEY,
    Country VARCHAR(100) NOT NULL,
    Province VARCHAR(100) NOT NULL,
    PostalCode VARCHAR(20) NOT NULL,
    City VARCHAR(100) NOT NULL,
    Street VARCHAR(255) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Admin (
    AdminID SERIAL PRIMARY KEY,
    Username VARCHAR(50) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


;
CREATE TABLE voter (
    VoterID SERIAL PRIMARY KEY,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    IdNumber VARCHAR(50) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    DateOfBirth DATE NOT NULL,
    AddressID INTEGER,
    PhoneNumber VARCHAR(20),
    HasVoted BOOLEAN DEFAULT FALSE,
    IsVerified BOOLEAN DEFAULT FALSE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_voter_address FOREIGN KEY (AddressID) 
        REFERENCES Address(AddressID) 
        ON DELETE SET NULL 
        ON UPDATE CASCADE
);

CREATE TABLE ElectionType (
    ElectionTypeID SERIAL PRIMARY KEY,
    TypeName VARCHAR(100) UNIQUE NOT NULL,
    Description TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Election (
    ElectionID SERIAL PRIMARY KEY,
    ElectionTypeID INTEGER NOT NULL,
    ElectionName VARCHAR(255) NOT NULL,
    AdminID INTEGER NOT NULL,
    StartDate TIMESTAMP NOT NULL,
    EndDate TIMESTAMP NOT NULL,
    IsActive BOOLEAN DEFAULT FALSE,
    Description TEXT,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_election_type FOREIGN KEY (ElectionTypeID) 
        REFERENCES ElectionType(ElectionTypeID) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT fk_election_admin FOREIGN KEY (AdminID) 
        REFERENCES Admin(AdminID) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    CONSTRAINT chk_election_dates CHECK (EndDate > StartDate)
);

CREATE TABLE Candidate (
    CandidateID SERIAL PRIMARY KEY,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    IdNumber VARCHAR(50) UNIQUE NOT NULL,
    Email VARCHAR(255) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Position VARCHAR(100) NOT NULL,
    ProfileImage TEXT,
    Biography TEXT,
    IsVerified BOOLEAN DEFAULT FALSE,
    ElectionID INTEGER NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_candidate_election FOREIGN KEY (ElectionID) 
        REFERENCES Election(ElectionID) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

CREATE TABLE Vote (
    VoteID SERIAL PRIMARY KEY,
    VoterID INTEGER NOT NULL,
    ElectionID INTEGER NOT NULL,
    CandidateID INTEGER NOT NULL,
    VotedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vote_voter FOREIGN KEY (VoterID) 
        REFERENCES Voter(VoterID) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_vote_election FOREIGN KEY (ElectionID) 
        REFERENCES Election(ElectionID) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_vote_candidate FOREIGN KEY (CandidateID) 
        REFERENCES Candidate(CandidateID) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT unique_voter_election UNIQUE (VoterID, ElectionID)
);


CREATE TABLE AdminAuditLog (
    AuditLogID SERIAL PRIMARY KEY,
    AdminID INTEGER NOT NULL,
    ActionType VARCHAR(100) NOT NULL,
    ActionDetails TEXT,
    PerformedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_admin_audit_admin FOREIGN KEY (AdminID) 
        REFERENCES Admin(AdminID) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

CREATE TABLE VoterAuditLog (
    AuditLogID SERIAL PRIMARY KEY,
    VoterID INTEGER NOT NULL,
    ActionType VARCHAR(100) NOT NULL,
    ActionDetails TEXT,
    PerformedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_voter_audit_voter FOREIGN KEY (VoterID) 
        REFERENCES Voter(VoterID) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);


CREATE TABLE refreshToken (
    refreshTokenID SERIAL PRIMARY KEY,
    voterID INTEGER REFERENCES "voter"(VoterID) ON DELETE CASCADE,
    candidateID INTEGER REFERENCES "candidate"(CandidateID) ON DELETE CASCADE,
    token TEXT NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    expiresAt TIMESTAMP,
    createdAt TIMESTAMP DEFAULT NOW(),
    updatedAt TIMESTAMP DEFAULT NOW(),
    CONSTRAINT refreshToken_one_id_required 
        CHECK (
            ("voterid" IS NOT NULL AND "candidateid" IS NULL) OR 
            ("voterid" IS NULL AND "candidateid" IS NOT NULL)
        )
);

CREATE TABLE resetPasswordToken (
    resetPasswordId SERIAL PRIMARY KEY,
    voterID INTEGER REFERENCES "voter"(VoterID) ON DELETE CASCADE,
    candidateID INTEGER REFERENCES "candidate"(CandidateID) ON DELETE CASCADE,
    token TEXT NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    expiredAt TIMESTAMP,
    createdAt TIMESTAMP DEFAULT NOW(),
    UpdatedAt TIMESTAMP DEFAULT NOW(),
    CONSTRAINT resetPasswordToken_one_id_required 
        CHECK (
            ("voterid" IS NOT NULL AND "candidateid" IS NULL) OR 
            ("voterid" IS NULL AND "candidateid" IS NOT NULL)
        )
);

CREATE TABLE emailVerificationToken (
    emailVerficationID SERIAL PRIMARY KEY,
    voterID INTEGER REFERENCES "voter"(VoterID) ON DELETE CASCADE,
    candidateID INTEGER REFERENCES "candidate"(CandidateID) ON DELETE CASCADE,
    token TEXT NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    expiredAt TIMESTAMP,
    createdAt TIMESTAMP DEFAULT NOW(),
    UpdatedAt TIMESTAMP DEFAULT NOW(),
    CONSTRAINT emailVerificationToken_one_id_required 
        CHECK (
            ("voterid" IS NOT NULL AND "candidateid" IS NULL) OR 
            ("voterid" IS NULL AND "candidateid" IS NOT NULL)
        )
);

CREATE INDEX idx_address_country ON Address(Country);
CREATE INDEX idx_address_province ON Address(Province);
CREATE INDEX idx_address_city ON Address(City);
CREATE INDEX idx_voter_email ON Voter(Email);
CREATE INDEX idx_voter_idnumber ON Voter(IdNumber);
CREATE INDEX idx_voter_address ON Voter(AddressID);
CREATE INDEX idx_voter_verified ON Voter(IsVerified);
CREATE INDEX idx_voter_hasvoted ON Voter(HasVoted);

CREATE INDEX idx_election_type ON Election(ElectionTypeID);
CREATE INDEX idx_election_admin ON Election(AdminID);
CREATE INDEX idx_election_active ON Election(IsActive);
CREATE INDEX idx_election_dates ON Election(StartDate, EndDate);

CREATE INDEX idx_candidate_election ON Candidate(ElectionID);
CREATE INDEX idx_candidate_idnumber ON Candidate(IdNumber);

-- Vote indexes
CREATE INDEX idx_vote_voter ON Vote(VoterID);
CREATE INDEX idx_vote_election ON Vote(ElectionID);
CREATE INDEX idx_vote_candidate ON Vote(CandidateID);
CREATE INDEX idx_vote_timestamp ON Vote(VotedAt);

-- Audit log indexes
CREATE INDEX idx_admin_audit_admin ON AdminAuditLog(AdminID);
CREATE INDEX idx_admin_audit_timestamp ON AdminAuditLog(PerformedAt);
CREATE INDEX idx_voter_audit_voter ON VoterAuditLog(VoterID);
CREATE INDEX idx_voter_audit_timestamp ON VoterAuditLog(PerformedAt);


-- Function to update UpdatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.UpdatedAt = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for UpdatedAt columns
CREATE TRIGGER update_address_updated_at
    BEFORE UPDATE ON Address
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_updated_at
    BEFORE UPDATE ON Admin
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voter_updated_at
    BEFORE UPDATE ON Voter
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_election_type_updated_at
    BEFORE UPDATE ON ElectionType
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_election_updated_at
    BEFORE UPDATE ON Election
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidate_updated_at
    BEFORE UPDATE ON Candidate
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update voter HasVoted status after voting
CREATE OR REPLACE FUNCTION update_voter_has_voted()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE Voter 
    SET HasVoted = TRUE 
    WHERE VoterID = NEW.VoterID;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update HasVoted when a vote is cast
CREATE TRIGGER trigger_update_voter_has_voted
    AFTER INSERT ON Vote
    FOR EACH ROW
    EXECUTE FUNCTION update_voter_has_voted();

-- Function to prevent voting in inactive elections
CREATE OR REPLACE FUNCTION check_election_active()
RETURNS TRIGGER AS $$
DECLARE
    election_active BOOLEAN;
    election_start TIMESTAMP;
    election_end TIMESTAMP;
BEGIN
    SELECT IsActive, StartDate, EndDate 
    INTO election_active, election_start, election_end
    FROM Election 
    WHERE ElectionID = NEW.ElectionID;
    
    IF NOT election_active THEN
        RAISE EXCEPTION 'Cannot vote in inactive election';
    END IF;
    
    IF CURRENT_TIMESTAMP < election_start THEN
        RAISE EXCEPTION 'Election has not started yet';
    END IF;
    
    IF CURRENT_TIMESTAMP > election_end THEN
        RAISE EXCEPTION 'Election has ended';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check election status before voting
CREATE TRIGGER trigger_check_election_active
    BEFORE INSERT ON Vote
    FOR EACH ROW
    EXECUTE FUNCTION check_election_active();

-- Function to prevent voting if voter is not verified
CREATE OR REPLACE FUNCTION check_voter_verified()
RETURNS TRIGGER AS $$
DECLARE
    voter_verified BOOLEAN;
BEGIN
    SELECT IsVerified INTO voter_verified
    FROM Voter 
    WHERE VoterID = NEW.VoterID;
    
    IF NOT voter_verified THEN
        RAISE EXCEPTION 'Voter must be verified before voting';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check voter verification before voting
CREATE TRIGGER trigger_check_voter_verified
    BEFORE INSERT ON Vote
    FOR EACH ROW
    EXECUTE FUNCTION check_voter_verified();


-- View: Active Elections
CREATE OR REPLACE VIEW ActiveElections AS
SELECT 
    e.ElectionID,
    e.ElectionName,
    et.TypeName AS ElectionType,
    e.StartDate,
    e.EndDate,
    e.Description,
    a.Username AS AdminUsername,
    COUNT(DISTINCT c.CandidateID) AS CandidateCount,
    COUNT(DISTINCT v.VoteID) AS VoteCount
FROM Election e
JOIN ElectionType et ON e.ElectionTypeID = et.ElectionTypeID
JOIN Admin a ON e.AdminID = a.AdminID
LEFT JOIN Candidate c ON e.ElectionID = c.ElectionID
LEFT JOIN Vote v ON e.ElectionID = v.ElectionID
WHERE e.IsActive = TRUE
    AND CURRENT_TIMESTAMP BETWEEN e.StartDate AND e.EndDate
GROUP BY e.ElectionID, e.ElectionName, et.TypeName, e.StartDate, e.EndDate, e.Description, a.Username;

-- View: Election Results
CREATE OR REPLACE VIEW ElectionResults AS
SELECT 
    e.ElectionID,
    e.ElectionName,
    c.CandidateID,
    c.FirstName || ' ' || c.LastName AS CandidateName,
    c.Position,
    COUNT(v.VoteID) AS VoteCount,
    ROUND(
        (COUNT(v.VoteID)::DECIMAL / NULLIF(
            (SELECT COUNT(*) FROM Vote WHERE ElectionID = e.ElectionID), 0
        )) * 100, 2
    ) AS VotePercentage
FROM Election e
JOIN Candidate c ON e.ElectionID = c.ElectionID
LEFT JOIN Vote v ON c.CandidateID = v.CandidateID
GROUP BY e.ElectionID, e.ElectionName, c.CandidateID, c.FirstName, c.LastName, c.Position
ORDER BY e.ElectionID, VoteCount DESC;

-- View: Voter Statistics
CREATE OR REPLACE VIEW VoterStatistics AS
SELECT 
    COUNT(*) AS TotalVoters,
    COUNT(CASE WHEN IsVerified = TRUE THEN 1 END) AS VerifiedVoters,
    COUNT(CASE WHEN HasVoted = TRUE THEN 1 END) AS VotersWhoVoted,
    COUNT(CASE WHEN IsVerified = TRUE AND HasVoted = FALSE THEN 1 END) AS VerifiedNotVoted,
    ROUND(
        (COUNT(CASE WHEN HasVoted = TRUE THEN 1 END)::DECIMAL / 
         NULLIF(COUNT(CASE WHEN IsVerified = TRUE THEN 1 END), 0)) * 100, 2
    ) AS VoterTurnoutPercentage
FROM Voter;

-- ============================================
-- Initial Data (Optional)
-- ============================================


-- Insert default election types
INSERT INTO ElectionType (TypeName, Description) VALUES
    ('Presidential', 'National presidential election'),
    ('Parliamentary', 'Parliamentary or legislative election'),
    ('Local Government', 'Municipal or local government election'),
    ('Referendum', 'Public referendum or ballot initiative'),
    ('Primary', 'Primary election for party candidates')
ON CONFLICT (TypeName) DO NOTHING;

-- ============================================
-- Grants and Permissions
-- ============================================

-- Grant select on views to public
GRANT SELECT ON ElectionResults TO PUBLIC;
GRANT SELECT ON VoterStatistics TO PUBLIC;
-- ============================================
-- Comments for Documentation
-- ============================================

COMMENT ON TABLE Address IS 'Stores physical address information for voters';
COMMENT ON TABLE Admin IS 'Administrator accounts with system management privileges';
COMMENT ON TABLE Voter IS 'Registered voters with authentication credentials';
COMMENT ON TABLE ElectionType IS 'Categories of elections (Presidential, Parliamentary, etc.)';
COMMENT ON TABLE Election IS 'Election events with dates and configuration';
COMMENT ON TABLE Candidate IS 'Candidates running in specific elections';
COMMENT ON TABLE Vote IS 'Individual vote records linking voters to candidates';
COMMENT ON TABLE AdminAuditLog IS 'Audit trail of all administrative actions';
COMMENT ON TABLE VoterAuditLog IS 'Audit trail of all voter actions';
COMMENT ON TABLE refreshToken IS 'Refresh tokens for authentication. Each token is associated with either a voter OR a candidate, not both.';
COMMENT ON TABLE resetPasswordToken IS 'Password reset tokens. Each token is associated with either a voter OR a candidate, not both.';
COMMENT ON TABLE emailVerificationToken IS 'Email verification tokens. Each token is associated with either a voter OR a candidate, not both.';

-- ============================================
-- Schema Creation Complete
-- ============================================

-- Display success message
DO $$
BEGIN
    RAISE NOTICE 'Online Voting System schema created successfully!';
    RAISE NOTICE 'Tables created: 9';
    RAISE NOTICE 'Views created: 3';
    RAISE NOTICE 'Triggers created: 9';
    RAISE NOTICE 'Functions created: 5';
END $$;