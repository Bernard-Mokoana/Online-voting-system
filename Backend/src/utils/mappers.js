const pickFirst = (...values) => values.find((value) => value !== undefined && value !== null);

export const mapElectionRow = (row) => ({
  electionId: pickFirst(row.electionid, row.ElectionID),
  electionName: pickFirst(row.electionname, row.ElectionName),
  electionType: pickFirst(row.electiontype, row.ElectionType),
  electionTypeId: pickFirst(row.electiontypeid, row.ElectionTypeID),
  adminId: pickFirst(row.adminid, row.AdminID),
  adminUsername: pickFirst(row.adminusername, row.AdminUsername),
  description: row.description ?? "",
  startDate: pickFirst(row.startdate, row.StartDate),
  endDate: pickFirst(row.enddate, row.EndDate),
  isActive: pickFirst(row.isactive, row.IsActive),
  candidateCount: pickFirst(row.candidatecount, row.CandidateCount),
  voteCount: pickFirst(row.votecount, row.VoteCount),
  createdAt: pickFirst(row.createdat, row.CreatedAt),
  updatedAt: pickFirst(row.updatedat, row.UpdatedAt),
});

export const mapCandidateRow = (row) => ({
  candidateId: pickFirst(row.candidateid, row.CandidateID),
  firstName: pickFirst(row.firstname, row.FirstName),
  lastName: pickFirst(row.lastname, row.LastName),
  idNumber: pickFirst(row.idnumber, row.IdNumber),
  email: row.email,
  position: row.position ?? "",
  biography: row.biography ?? "",
  profileImage: pickFirst(row.profileimage, row.ProfileImage),
  electionId: pickFirst(row.electionid, row.ElectionID),
  isVerified: pickFirst(row.isverified, row.IsVerified),
  createdAt: pickFirst(row.createdat, row.CreatedAt),
  updatedAt: pickFirst(row.updatedat, row.UpdatedAt),
});

export const mapVoterRow = (row) => ({
  voterId: pickFirst(row.voterid, row.VoterID),
  firstName: pickFirst(row.firstname, row.FirstName),
  lastName: pickFirst(row.lastname, row.LastName),
  email: row.email,
  idNumber: pickFirst(row.idnumber, row.IdNumber),
  dateOfBirth: pickFirst(row.dateofbirth, row.DateOfBirth),
  phoneNumber: pickFirst(row.phonenumber, row.PhoneNumber),
  profileImageUrl: pickFirst(row.profileimageurl, row.ProfileImageUrl),
  hasVoted: pickFirst(row.hasvoted, row.HasVoted),
  isVerified: pickFirst(row.isverified, row.IsVerified),
  createdAt: pickFirst(row.createdat, row.CreatedAt),
  updatedAt: pickFirst(row.updatedat, row.UpdatedAt),
});

export const mapVoteResultRow = (row) => ({
  electionId: pickFirst(row.electionid, row.ElectionID),
  electionName: pickFirst(row.electionname, row.ElectionName),
  candidateId: pickFirst(row.candidateid, row.CandidateID),
  candidateName: pickFirst(row.candidatename, row.CandidateName),
  position: row.position ?? "",
  voteCount: Number(pickFirst(row.votecount, row.VoteCount) ?? 0),
  votePercentage: Number(pickFirst(row.votepercentage, row.VotePercentage) ?? 0),
});

export const mapVotingHistoryRow = (row) => ({
  voteId: pickFirst(row.voteid, row.VoteID),
  votedAt: pickFirst(row.votedat, row.VotedAt),
  election: {
    electionId: pickFirst(row.electionid, row.ElectionID),
    electionName: pickFirst(row.electionname, row.ElectionName),
  },
  candidate: {
    candidateId: pickFirst(row.candidateid, row.CandidateID),
    firstName: pickFirst(row.firstname, row.FirstName),
    lastName: pickFirst(row.lastname, row.LastName),
  },
});
