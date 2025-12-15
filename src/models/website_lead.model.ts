export interface WebsiteLead {
  id?: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  course?: string | null;
  specialization?: string | null;
  state?: string | null;
  city?: string | null;
  lead_source?: string | null;
  sub_source?: string | null;
  utm_source?: string | null;
  utm_campaign?: string | null;
  utm_adgroup?: string | null;
  utm_ads?: string | null;
  website_url?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

