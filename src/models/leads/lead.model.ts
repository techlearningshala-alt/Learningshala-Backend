export interface Lead {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  course: string | null;
  specialisation: string | null;
  state: string | null;
  city: string | null;
  lead_source: string | null;
  sub_source: string | null;
  highest_qualification: string | null;
  preferred_budget: string | null;
  emi_required: string | null;
  salary: string | null;
  percentage: string | null;
  experience: string | null;
  currently_employed: string | null;
  university_for_placement_salaryhike_promotions: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  utm_adgroup: string | null;
  utm_ads: string | null;
  created_on: Date | null;
  website_url: string | null;
}

export interface CreateLeadDto {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  course?: string | null;
  specialisation?: string | null;
  state?: string | null;
  city?: string | null;
  lead_source?: string | null;
  sub_source?: string | null;
  highest_qualification?: string | null;
  preferred_budget?: string | null;
  emi_required?: string | null;
  salary?: string | null;
  percentage?: string | null;
  experience?: string | null;
  currently_employed?: string | null;
  university_for_placement_salaryhike_promotions?: string | null;
  utm_source?: string | null;
  utm_campaign?: string | null;
  utm_adgroup?: string | null;
  utm_ads?: string | null;
  created_on?: Date | null;
  website_url?: string | null;
}

