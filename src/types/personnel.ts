export interface PersonalProfile {
  id?: string;
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

export interface PersonnelAssignment {
  department: string;
  position: string;
  specialty?: string;
  isPrimary: boolean;
}

export interface CreatePersonnelPayload {
  photoUrl?: string;
  fullName: string;
  penName?: string;
  birthDate?: string;
  gender?: string;
  participateEvaluation: boolean;
  employmentType: string;
  isYouthUnionMember: boolean;
  isPartyMember: boolean;
  leaveEffectiveDate?: string;
  phone: string;
  extension?: string;
  department: string;
  position: string;
  isPrimaryAssignment: boolean;
  specialtyDepartment?: string;
  specialty?: string;
  assignments?: PersonnelAssignment[];
  identityNumber?: string;
  identityIssuedDate?: string;
  identityIssuedPlace?: string;
  email: string;
  secondaryEmail?: string;
  notes?: string;
  action: 'submit' | 'complete';
}

export interface PersonnelRecordItem {
  id: string;
  employeeCode: string;
  fullName: string;
  penName?: string;
  photoUrl?: string;
  birthDate?: string;
  gender?: string;
  phone: string;
  extension?: string;
  email: string;
  secondaryEmail?: string;
  employmentType: string;
  department: string;
  position: string;
  specialty?: string;
  assignments: PersonnelAssignment[];
  participateEvaluation: boolean;
  isYouthUnionMember: boolean;
  isPartyMember: boolean;
  leaveEffectiveDate?: string;
  identityNumber?: string;
  identityIssuedDate?: string;
  identityIssuedPlace?: string;
  notes?: string;
  profileType?: '2A' | '2B' | '2C';
  status: 'complete' | 'submitted' | 'draft';
  createdAt: string;
}

export interface PersonnelChangeFieldItem {
  fieldKey: string;
  fieldLabel: string;
  currentValue: string;
  newValue: string;
}

export interface PersonnelChangeRequest {
  id: string;
  code: string;
  personnelId: string;
  employeeCode: string;
  fullName: string;
  department: string;
  profileType: '2A' | '2B' | '2C';
  fields: PersonnelChangeFieldItem[];
  reason?: string;
  attachmentName?: string;
  requestedBy: string;
  requestedAt: string;
  status: 'new' | 'in_progress' | 'approved' | 'returned';
  snapshotPdfName: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComment?: string;
}
