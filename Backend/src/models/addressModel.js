// src/models/addressModel.js
import pool from "../config/db.js";

export const createAddress = async ({
  country,
  province,
  city,
  streetAddress,
}) => {
  const result = await pool.query(
    `INSERT INTO Address (Country, Province, City, StreetAddress)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [country, province, city, streetAddress]
  );
  return result.rows[0];
};

export const getAllAddresses = async () => {
  const result = await pool.query(`SELECT * FROM Address`);
  return result.rows;
};
