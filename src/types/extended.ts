export interface WorkspaceRecord {
  id: string;
  title: string;
  subtitle: string;
  status?: string;
  category?: string;
  description: string;
  meta: Array<{ label: string; value: string }>;
}

export interface WorkspaceFile extends WorkspaceRecord {
  kind: 'folder' | 'pdf' | 'sheet';
  size?: string;
}

export interface ExpertRecord extends WorkspaceRecord {
  initials: string;
  field: string;
  organization: string;
  email: string;
  phone: string;
  rating: string;
  collaborations: number;
}
