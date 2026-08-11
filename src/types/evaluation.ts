export type EvaluationStage = 'self' | 'deputy' | 'manager' | 'editorial' | 'council' | 'published';
export type EvaluationStatus = 'draft' | 'waiting' | 'in_review' | 'completed' | 'published';
export type EvaluationQuestionType = 'choice' | 'number' | 'system';

export interface StageMilestone {
  stage: EvaluationStage;
  stageLabel: string;
  startAt: string;
  dueAt: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface IndividualWorkflowStep {
  stage: EvaluationStage;
  stageLabel: string;
  reviewerName: string;
  reviewerRole: string;
  reviewerDepartment: string;
  status: 'pending' | 'active' | 'approved' | 'rejected';
  completedAt?: string;
}

export interface EvaluationPeriod {
  id: string;
  label: string;
  startAt: string;
  dueAt: string;
  status: 'active' | 'closed';
  stageMilestones?: StageMilestone[];
}

export interface EvaluationLevel {
  label: string;
  min: number;
  max: number;
}

export interface EvaluationCriterion {
  id: string;
  groupId: string;
  title: string;
  type: EvaluationQuestionType;
  min: number;
  max: number;
  score: number | null;
  previousScore?: number;
  stageScores?: Partial<Record<EvaluationStage, number>>;
  stageNotes?: Partial<Record<EvaluationStage, string>>;
  note?: string;
  levels?: EvaluationLevel[];
}

export interface EvaluationGroup {
  id: string;
  title: string;
  kind: 'normal' | 'bonus' | 'deduction';
  criteria: EvaluationCriterion[];
}

export interface EvaluationSheet {
  id: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  position: string;
  periodId: string;
  periodLabel: string;
  status: EvaluationStatus;
  stage: EvaluationStage;
  progress: number;
  selfScore: number | null;
  currentScore: number | null;
  stageTotals?: Partial<Record<EvaluationStage, number>>;
  stageEvaluators?: Partial<Record<EvaluationStage, string>>;
  evaluatorName?: string;
  dueAt: string;
  updatedAt: string;
  groups: EvaluationGroup[];
}

export interface EvaluationSummary {
  period: EvaluationPeriod;
  total: number;
  waitingForMe: number;
  inProgress: number;
  published: number;
}
