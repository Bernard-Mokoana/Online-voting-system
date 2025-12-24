# Schema Fix for refreshToken Table

## Problem
The `refreshToken` table currently requires both `voterID` and `candidateID` to be NOT NULL. However, users are either voters OR candidates (not both), which causes constraint violations when trying to insert refresh tokens.

## Solution
Run the migration script `fix_refreshToken_schema.sql` to:
1. Make both `voterID` and `candidateID` nullable
2. Add a check constraint ensuring exactly one ID is set (not both, not neither)
3. Maintain foreign key constraints for data integrity

## How to Apply

1. Connect to your PostgreSQL database
2. Run the migration script:
   ```bash
   psql -U your_username -d OnlineVotingSystem -f sql_script/fix_refreshToken_schema.sql
   ```

Or execute the SQL commands directly in your database client.

## What This Changes

- **Before**: Both `voterID` and `candidateID` were required (NOT NULL)
- **After**: One of `voterID` or `candidateID` is required, the other must be NULL

This allows the refresh token system to work correctly for both voters and candidates as separate entities.

