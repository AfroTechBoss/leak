export const CATEGORIES = [
  { id: 'budget',    label: 'Budget Fraud' },
  { id: 'contract',  label: 'Contract Manipulation' },
  { id: 'electoral', label: 'Electoral Misconduct' },
  { id: 'land',      label: 'Land Grabbing' },
  { id: 'police',    label: 'Police / Security Abuse' },
  { id: 'other',     label: 'Other' },
] as const;

export const STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT (Abuja)','Gombe',
  'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto',
  'Taraba','Yobe','Zamfara',
] as const;

export const NEWSROOMS = ['Premium Times', 'TheCable', 'Peoples Gazette', 'HumAngle'] as const;

export const STATUS_LABELS: Record<string, string> = {
  NEW: 'New',
  UNDER_REVIEW: 'Under Review',
  INVESTIGATION_OPENED: 'Investigation Opened',
  PUBLISHED: 'Published',
  REJECTED: 'Rejected',
  ARCHIVED: 'Archived',
};

export const STATUS_BADGE: Record<string, string> = {
  NEW: 'badge-new',
  UNDER_REVIEW: 'badge-review',
  INVESTIGATION_OPENED: 'badge-open',
  PUBLISHED: 'badge-published',
  REJECTED: 'badge-rejected',
  ARCHIVED: 'badge-archived',
};

export type CategoryId = typeof CATEGORIES[number]['id'];
export type StateName = typeof STATES[number];
export type Newsroom = typeof NEWSROOMS[number];
