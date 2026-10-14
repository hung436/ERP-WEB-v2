export interface CloudShareUserPermission {
  canShare?: boolean;
  canEdit?: boolean;
  create?: boolean;
  change?: boolean;
  delete?: boolean;
  expirationDate?: string | null;
}

export interface CloudSharedUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: 'viewer' | 'commenter' | 'editor';
  isGroup?: boolean;
  permissions?: CloudShareUserPermission;
}

export type CloudPublicLinkPermission =
  | 'download_view'
  | 'download_view_upload'
  | 'download_view_upload_edit'
  | 'upload_only';

export interface CloudPublicLink {
  id: string;
  name: string;
  url: string;
  permission: CloudPublicLinkPermission;
  password?: string;
  expirationDate?: string | null;
  createdAt?: string;
}

export interface CloudItem {
  id: string;
  name: string;
  type: 'folder' | 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'image' | 'archive' | 'audio' | 'video' | 'code' | 'other';
  parentId: string | null; // null là ở root
  size?: number; // bytes
  sizeFormatted?: string;
  updatedAt: string;
  updatedBy: string;
  owner: {
    id: string;
    name: string;
    avatar?: string;
    email: string;
  };
  isStarred?: boolean;
  isShared?: boolean;
  sharedWith?: CloudSharedUser[];
  publicLinks?: CloudPublicLink[];
  generalAccess?: 'restricted' | 'domain' | 'anyone';
  generalRole?: 'viewer' | 'commenter' | 'editor';
  isDeleted?: boolean;
  deletedAt?: string;
  thumbnailUrl?: string;
  description?: string;
  tags?: string[];
  version?: number;
}

export type CloudNavigationTab =
  | 'quick-access'
  | 'recent'
  | 'starred'
  | 'my-cloud'
  | 'shared-with-me'
  | 'shared-by-me'
  | 'shared-drives'
  | 'trash';

export type CloudViewMode = 'details' | 'grid';

export type CloudSortField = 'name' | 'updatedAt' | 'owner' | 'size' | 'type';
export type CloudSortOrder = 'asc' | 'desc';
