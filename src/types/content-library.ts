export interface ContentItem {
  id: string;
  title: string;
  description: string;
  contentType: 'document' | 'video' | 'image' | 'template' | 'scorm';
  organizationId: string;
  createdBy: string;
  currentVersionId: string | null;
  versionCount: number;
  tags: string[];
  status: 'draft' | 'pending_review' | 'approved' | 'archived';
  approvedBy: string | null;
  approvedAt: string | null;
  createdAt: string;
}

export interface ContentVersion {
  id: string;
  contentItemId: string;
  versionNumber: number;
  changelog: string;
  fileUrl: string;
  fileSize: number;
  createdBy: string;
  createdAt: string;
}

export interface ContentApproval {
  id: string;
  contentItemId: string;
  reviewerId: string;
  reviewerName: string;
  decision: 'approved' | 'rejected' | 'needs_changes';
  comments: string;
  createdAt: string;
}

export interface ContentLibraryAnalytics {
  totalItems: number;
  approvedItems: number;
  pendingReview: number;
  totalVersions: number;
  itemsByType: Record<string, number>;
}
