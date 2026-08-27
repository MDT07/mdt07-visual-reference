export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      mdt07_projects: {
        Row: {
          id: string;
          owner_github_id: string;
          name: string;
          brief: string;
          status: "active" | "archived";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_github_id: string;
          name: string;
          brief?: string;
          status?: "active" | "archived";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          brief?: string;
          status?: "active" | "archived";
          updated_at?: string;
        };
        Relationships: [];
      };
      mdt07_collections: {
        Row: {
          id: string;
          project_id: string;
          owner_github_id: string;
          name: string;
          description: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          owner_github_id: string;
          name: string;
          description?: string;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      mdt07_references: {
        Row: {
          id: string;
          project_id: string;
          collection_id: string;
          owner_github_id: string;
          source: string;
          source_id: string;
          source_url: string;
          reference_data: Json;
          notes: string;
          tags: string[];
          favorite: boolean;
          workflow_status: "saved" | "shortlisted" | "archived";
          saved_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          collection_id: string;
          owner_github_id: string;
          source: string;
          source_id: string;
          source_url: string;
          reference_data: Json;
          notes?: string;
          tags?: string[];
          favorite?: boolean;
          workflow_status?: "saved" | "shortlisted" | "archived";
          saved_at?: string;
          updated_at?: string;
        };
        Update: {
          reference_data?: Json;
          notes?: string;
          tags?: string[];
          favorite?: boolean;
          workflow_status?: "saved" | "shortlisted" | "archived";
          saved_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      mdt07_pinterest_connections: {
        Row: {
          session_id_hash: string;
          owner_github_id: string;
          encrypted_payload: string;
          access_expires_at: string;
          refresh_expires_at: string | null;
          created_at: string;
          updated_at: string;
          last_used_at: string;
        };
        Insert: {
          session_id_hash: string;
          owner_github_id: string;
          encrypted_payload: string;
          access_expires_at: string;
          refresh_expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
          last_used_at?: string;
        };
        Update: {
          encrypted_payload?: string;
          access_expires_at?: string;
          refresh_expires_at?: string | null;
          updated_at?: string;
          last_used_at?: string;
        };
        Relationships: [];
      };
      mdt07_rate_limits: {
        Row: {
          namespace: string;
          subject_hash: string;
          request_count: number;
          reset_at: string;
          updated_at: string;
        };
        Insert: {
          namespace: string;
          subject_hash: string;
          request_count: number;
          reset_at: string;
          updated_at?: string;
        };
        Update: {
          request_count?: number;
          reset_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      mdt07_audit_events: {
        Row: {
          id: number;
          owner_github_id: string | null;
          action: string;
          target_type: string | null;
          target_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: never;
          owner_github_id?: string | null;
          action: string;
          target_type?: string | null;
          target_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      mdt07_consume_rate_limit: {
        Args: {
          p_namespace: string;
          p_subject_hash: string;
          p_limit: number;
          p_window_seconds: number;
        };
        Returns: {
          allowed: boolean;
          remaining: number;
          retry_after: number;
        }[];
      };
      mdt07_cleanup_expired_security_state: {
        Args: Record<PropertyKey, never>;
        Returns: {
          expired_connections: number;
          expired_rate_limits: number;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
