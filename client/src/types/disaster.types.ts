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
export type Report = {
  id: string;
  disaster_id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  verification_status: 'verified' | 'rejected' | 'pending';
  created_at: string;
};
export type OfficialUpdate = {
  id: string;
  disaster_id: string;
  title: string;
  description: string;
  posted_by: string;
  created_at: string;
};
export type Resource = {
  id: string;
  disaster_id: string;
  name: string;
  type: string;
  description?: string;
  location_name?: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
};
export interface Tweet {
  id: string;
  text: string;
  username: string;
  created_at: string;
  url?: string;
  profile_image_url?: string;
  platform: 'twitter' | 'reddit' | 'instagram' | 'other';
}

