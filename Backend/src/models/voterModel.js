// models/voterModel.js
import pool from "../config/db.js";

export const createVoter = async (voter) => {
  const {
    voterID,
    firstName,
    lastName,
    email,
    idNumber,
    password,
    dateOfBirth,
    addressID,
    phoneNumber,
  } = voter;

  const result = await pool.query(
    `INSERT INTO Voter (
      VoterID, FirstName, LastName, Email, IdNumber,
      Password, DateOfBirth, AddressID, PhoneNumber
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [
      voterID,
      firstName,
      lastName,
      email,
      idNumber,
      password,
      dateOfBirth,
      addressID,
      phoneNumber,
    ]
  );

  return result.rows[0];
};

export const getAllVoters = async () => {
  const result = await pool.query(`
    SELECT v.*, a.Country, a.Province, a.City, a.StreetAddress
    FROM Voter v
    JOIN Address a ON v.AddressID = a.AddressID
    ORDER BY v.VoterID
  `);
  return result.rows;
};
