export interface VideoCounsellingSlot {
  date: string;
  time: string;
}

export interface StudentLead {
  id?: number;
  name: string;
  qualification?: string | null;
  specialization?: string | null;
  goal?: string | null;
  phone?: string | null;
  experience?: string | null;
  budget?: string | null;
  email?: string | null;
  chosen_programme?: string | null;
  video_counselling_slot?: VideoCounsellingSlot | null;
  preferred_callback_time?: string | null;
  admission_expert_requested?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface StudentLeadInput {
  name: string;
  qualification?: string;
  specialization?: string;
  goal?: string;
  phone?: string;
  experience?: string;
  budget?: string;
  email?: string;
  chosenProgramme?: string;
  videoCounsellingSlot?: VideoCounsellingSlot | null;
  preferredCallbackTime?: string;
  admissionExpertRequested?: boolean;
}
