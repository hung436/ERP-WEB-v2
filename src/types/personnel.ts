export interface PersonalProfile {
  employeeCode: string;
  fullName: string;
  avatarUrl?: string;
  phone: string;
  homePhone: string;
  email: string;
  currentPosition: string;
  department: string;
  birthDate: string;
  gender: string;
  birthPlace: string;
  hometown: string;
  permanentAddress: string;
  currentAddress: string;
  ethnicity: string;
  religion: string;
  nationality: string;
  identityNumber: string;
  identityIssuedDate: string;
  identityIssuedPlace: string;
  familyBackground: string;
  occupationAtRecruitment: string;
  generalEducation: string;
  professionalQualification: string;
  politicalTheory: string;
  foreignLanguages: string;
  informationTechnology: string;
  revolutionParticipationDate: string;
  revolutionActivity: string;
  recruitmentDate: string;
  recruitingAgency: string;
  enlistmentDate: string;
  dischargeDate: string;
  militaryRank: string;
  youthUnionJoinDate: string;
  youthUnionJoinPlace: string;
  partyProbationaryDate: string;
  partyOfficialDate: string;
  civilServantRank: string;
  rankCode: string;
  salaryGrade: string;
  salaryCoefficient: string;
  salaryEffectiveFrom: string;
  awardedTitle: string;
  healthStatus: string;
  height: string;
  weight: string;
  workStrengths: string;
  historyBeforeRecruitment: PersonnelTimelineRecord[];
  employmentHistory: PersonnelTimelineRecord[];
  personalHistoryNotes: string;
  partyJoinBranch: string;
  partyCommittee: string;
  partyIntroducers: string[];
  partyCardNumber: string;
  partyCardIssuedDate: string;
  politicalOrganizationHistory: PersonnelTimelineRecord[];
  trainingHistory: PersonnelTrainingRecord[];
  rewards: PersonnelDecisionRecord[];
  disciplines: PersonnelDecisionRecord[];
  familyRelations: PersonnelFamilyRelation[];
  socialRelations: PersonnelFamilyRelation[];
  selfAssessment: string;
}

export interface PersonnelTimelineRecord {
  period: string;
  details: string;
}

export interface PersonnelTrainingRecord {
  institution: string;
  specialization: string;
  period: string;
  mode: string;
  qualification: string;
}

export interface PersonnelDecisionRecord {
  date: string;
  content: string;
  decision: string;
}

export interface PersonnelFamilyRelation {
  relation: string;
  details: string;
}
