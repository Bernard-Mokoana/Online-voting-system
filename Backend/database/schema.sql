-- Address Table
CREATE TABLE IF NOT EXISTS Address (
    AddressID SERIAL PRIMARY KEY,
    Country VARCHAR(100) NOT NULL,
    Province VARCHAR(100) NOT NULL,
    PostalCode VARCHAR(20) NOT NULL,
    City VARCHAR(100) NOT NULL,
    Street VARCHAR(255) NOT NULL
);

-- ActionType Table
CREATE TABLE IF NOT EXISTS ActionType (
    ActionTypeID SERIAL PRIMARY KEY,
    TypeName VARCHAR(100) NOT NULL,
    Description TEXT
);

-- ElectionType Table
CREATE TABLE IF NOT EXISTS ElectionType (
    ElectionTypeID SERIAL PRIMARY KEY,
    TypeName VARCHAR(100) NOT NULL,
    Description TEXT
);

-- Admin Table
CREATE TABLE IF NOT EXISTS Admin (
    AdminID SERIAL PRIMARY KEY,
    Username VARCHAR(100) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL
);

-- Voter Table
CREATE TABLE IF NOT EXISTS Voter (
    VoterID SERIAL PRIMARY KEY,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    Email VARCHAR(255) NOT NULL UNIQUE,
    IdNumber VARCHAR(50) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    DateOfBirth DATE NOT NULL,
    AddressID INTEGER REFERENCES Address(AddressID),
    PhoneNumber VARCHAR(20),
    HasVoted BOOLEAN DEFAULT FALSE,
    IsVerified BOOLEAN DEFAULT FALSE,
    Timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Election Table
CREATE TABLE IF NOT EXISTS Election (
    ElectionID SERIAL PRIMARY KEY,
    ElectionTypeID INTEGER REFERENCES ElectionType(ElectionTypeID),
    ElectionName VARCHAR(255) NOT NULL,
    AdminID INTEGER REFERENCES Admin(AdminID),
    StartDate TIMESTAMP NOT NULL,
    EndDate TIMESTAMP NOT NULL,
    IsActive BOOLEAN DEFAULT TRUE,
    Description TEXT,
    Timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Position Table
CREATE TABLE IF NOT EXISTS Position (
    PositionID SERIAL PRIMARY KEY,
    Title VARCHAR(100) NOT NULL,
    Description TEXT,
    ElectionID INTEGER REFERENCES Election(ElectionID)
);

-- Candidate Table
CREATE TABLE IF NOT EXISTS Candidate (
    CandidateID SERIAL PRIMARY KEY,
    PositionID INTEGER REFERENCES Position(PositionID),
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    IdNumber VARCHAR(50) NOT NULL,
    Biography TEXT,
    ElectionID INTEGER REFERENCES Election(ElectionID),
    Timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vote Table
CREATE TABLE IF NOT EXISTS Vote (
    VoteID SERIAL PRIMARY KEY,
    VoterID INTEGER REFERENCES Voter(VoterID),
    ElectionID INTEGER REFERENCES Election(ElectionID),
    CandidateID INTEGER REFERENCES Candidate(CandidateID),
    Timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AdminAuditLog Table
CREATE TABLE IF NOT EXISTS AdminAuditLog (
    AuditLogID SERIAL PRIMARY KEY,
    AdminID INTEGER REFERENCES Admin(AdminID),
    ActionTypeID INTEGER REFERENCES ActionType(ActionTypeID),
    ActionDetails TEXT,
    Timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- VoterAuditLog Table
CREATE TABLE IF NOT EXISTS VoterAuditLog (
    AuditLogID SERIAL PRIMARY KEY,
    VoterID INTEGER REFERENCES Voter(VoterID),
    ActionTypeID INTEGER REFERENCES ActionType(ActionTypeID),
    ActionDetails TEXT,
    Timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
); 