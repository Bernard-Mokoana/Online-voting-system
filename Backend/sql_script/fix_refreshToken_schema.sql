ALTER TABLE "refreshtoken" ADD COLUMN "adminid" INTEGER REFERENCES "admin"(Adminid) ON DELETE CASCADE;

ALTER TABLE "refreshtoken" DROP CONSTRAINT "refreshtoken_one_id_required";

ALTER TABLE "refreshtoken" ADD CONSTRAINT "refreshtoken_one_id_required"
CHECK (
    (CASE WHEN "voterid" IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN "candidateid" IS NOT NULL THEN 1 ELSE 0 END +
     CASE WHEN "adminid" IS NOT NULL THEN 1 ELSE 0 END) = 1
);