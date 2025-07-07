export type AuditEntry = {
  action: 'create' | 'update' | 'delete';
  user_id: string;
  timestamp: string;
};

export type DisasterUpdate = {
  title?: string;
  location_name?: string;
  description?: string;
  tags?: string[];
  location?: { type: 'Point'; coordinates: [number, number] };
  audit_trail?: AuditEntry[];
};

export type Disaster = {
  id: string;
  title: string;
  description: string;
  tags?: string[];
  distance: number;
  location_name: string;
  location: { type: 'Point'; coordinates: [number, number] };
  created_at: string;
};
export type DisasterWithDistance = Disaster & {
  distance: number; 
};
