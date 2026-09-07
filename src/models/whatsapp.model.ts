export type WhatsAppConversationStatus = "open" | "closed";
export type WhatsAppMessageDirection = "inbound" | "outbound";

/**
 * One WhatsApp Business number per university.
 * After Meta Embedded Signup, save phone_number_id + waba_id here (admin Accounts UI).
 */
export interface WhatsAppUniversity {
  id: number;
  name: string;
  logo_url?: string | null;
  phone_number_id: string;
  waba_id: string;
  display_number?: string | null;
  created_at?: Date | string;
  updated_at?: Date | string;
}

export interface WhatsAppConversation {
  id: number;
  university_id: number;
  student_phone_number: string;
  status: WhatsAppConversationStatus;
  last_message_at?: Date | string | null;
  created_at?: Date | string;
  updated_at?: Date | string;
  // joined
  university_name?: string | null;
  university_logo_url?: string | null;
  display_number?: string | null;
  last_message_preview?: string | null;
}

export interface WhatsAppMessage {
  id: number;
  conversation_id: number;
  direction: WhatsAppMessageDirection;
  body: string;
  wa_message_id?: string | null;
  timestamp: Date | string;
  created_at?: Date | string;
}

export interface CreateWhatsAppUniversityDto {
  name: string;
  logo_url?: string | null;
  phone_number_id: string;
  waba_id: string;
  display_number?: string | null;
}

export interface UpdateWhatsAppUniversityDto {
  name?: string;
  logo_url?: string | null;
  phone_number_id?: string;
  waba_id?: string;
  display_number?: string | null;
}
