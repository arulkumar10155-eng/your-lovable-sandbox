export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      areas: {
        Row: {
          area_name: string
          city: string
          constituency: string
          created_at: string
          id: string
          polling_booths: string[] | null
        }
        Insert: {
          area_name: string
          city: string
          constituency: string
          created_at?: string
          id?: string
          polling_booths?: string[] | null
        }
        Update: {
          area_name?: string
          city?: string
          constituency?: string
          created_at?: string
          id?: string
          polling_booths?: string[] | null
        }
        Relationships: []
      }
      cadres: {
        Row: {
          active: boolean
          approved: boolean
          area: string | null
          city: string
          constituency: string | null
          created_at: string
          email: string | null
          id: string
          joined_at: string
          level: string
          name: string
          notes: string | null
          phone: string
          points: number
          profile_photo_url: string | null
          public_role_label: string | null
          public_visible: boolean
          rank_tier: string
          resolved_count: number
          role_title: string | null
          show_phone: boolean
          skills: string[] | null
          source: string | null
          stars: number
          updated_at: string
          user_id: string | null
          ward_number: string | null
        }
        Insert: {
          active?: boolean
          approved?: boolean
          area?: string | null
          city: string
          constituency?: string | null
          created_at?: string
          email?: string | null
          id?: string
          joined_at?: string
          level?: string
          name: string
          notes?: string | null
          phone: string
          points?: number
          profile_photo_url?: string | null
          public_role_label?: string | null
          public_visible?: boolean
          rank_tier?: string
          resolved_count?: number
          role_title?: string | null
          show_phone?: boolean
          skills?: string[] | null
          source?: string | null
          stars?: number
          updated_at?: string
          user_id?: string | null
          ward_number?: string | null
        }
        Update: {
          active?: boolean
          approved?: boolean
          area?: string | null
          city?: string
          constituency?: string | null
          created_at?: string
          email?: string | null
          id?: string
          joined_at?: string
          level?: string
          name?: string
          notes?: string | null
          phone?: string
          points?: number
          profile_photo_url?: string | null
          public_role_label?: string | null
          public_visible?: boolean
          rank_tier?: string
          resolved_count?: number
          role_title?: string | null
          show_phone?: boolean
          skills?: string[] | null
          source?: string | null
          stars?: number
          updated_at?: string
          user_id?: string | null
          ward_number?: string | null
        }
        Relationships: []
      }
      completed_works: {
        Row: {
          after_image_url: string | null
          area: string | null
          before_image_url: string | null
          beneficiaries: number | null
          category: string | null
          city: string | null
          completed_on: string | null
          constituency: string | null
          cost_amount: number | null
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          department: string | null
          description: string | null
          gallery_urls: string[] | null
          highlight: boolean | null
          id: string
          published: boolean | null
          reviews: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          after_image_url?: string | null
          area?: string | null
          before_image_url?: string | null
          beneficiaries?: number | null
          category?: string | null
          city?: string | null
          completed_on?: string | null
          constituency?: string | null
          cost_amount?: number | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          description?: string | null
          gallery_urls?: string[] | null
          highlight?: boolean | null
          id?: string
          published?: boolean | null
          reviews?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          after_image_url?: string | null
          area?: string | null
          before_image_url?: string | null
          beneficiaries?: number | null
          category?: string | null
          city?: string | null
          completed_on?: string | null
          constituency?: string | null
          cost_amount?: number | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          description?: string | null
          gallery_urls?: string[] | null
          highlight?: boolean | null
          id?: string
          published?: boolean | null
          reviews?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      corruption_reports: {
        Row: {
          amount_demanded: number | null
          area: string | null
          city: string | null
          confirmed_good_faith: boolean
          constituency: string | null
          created_at: string
          department: string | null
          description: string
          evidence_url: string | null
          evidence_urls: string[] | null
          id: string
          incident_date: string | null
          incident_time: string | null
          incident_type: string | null
          office_location: string | null
          person_involved: string | null
          person_name: string | null
          status: string
          ticket_no: string
        }
        Insert: {
          amount_demanded?: number | null
          area?: string | null
          city?: string | null
          confirmed_good_faith?: boolean
          constituency?: string | null
          created_at?: string
          department?: string | null
          description: string
          evidence_url?: string | null
          evidence_urls?: string[] | null
          id?: string
          incident_date?: string | null
          incident_time?: string | null
          incident_type?: string | null
          office_location?: string | null
          person_involved?: string | null
          person_name?: string | null
          status?: string
          ticket_no?: string
        }
        Update: {
          amount_demanded?: number | null
          area?: string | null
          city?: string | null
          confirmed_good_faith?: boolean
          constituency?: string | null
          created_at?: string
          department?: string | null
          description?: string
          evidence_url?: string | null
          evidence_urls?: string[] | null
          id?: string
          incident_date?: string | null
          incident_time?: string | null
          incident_type?: string | null
          office_location?: string | null
          person_involved?: string | null
          person_name?: string | null
          status?: string
          ticket_no?: string
        }
        Relationships: []
      }
      department_officers: {
        Row: {
          created_at: string
          department: string
          display_name: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department: string
          display_name?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department?: string
          display_name?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      email_outbox: {
        Row: {
          attempts: number
          body_html: string
          body_text: string | null
          created_at: string
          id: string
          idempotency_key: string | null
          last_error: string | null
          problem_id: string | null
          recipient_email: string
          recipient_role: string | null
          sent_at: string | null
          status: string
          subject: string
          trigger_code: string
        }
        Insert: {
          attempts?: number
          body_html: string
          body_text?: string | null
          created_at?: string
          id?: string
          idempotency_key?: string | null
          last_error?: string | null
          problem_id?: string | null
          recipient_email: string
          recipient_role?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          trigger_code: string
        }
        Update: {
          attempts?: number
          body_html?: string
          body_text?: string | null
          created_at?: string
          id?: string
          idempotency_key?: string | null
          last_error?: string | null
          problem_id?: string | null
          recipient_email?: string
          recipient_role?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          trigger_code?: string
        }
        Relationships: []
      }
      escalations: {
        Row: {
          created_at: string
          id: string
          problem_id: string
          raised_by: string | null
          raised_by_cadre_id: string | null
          reason: string
          resolved_at: string | null
          status: string
          to_level: string
        }
        Insert: {
          created_at?: string
          id?: string
          problem_id: string
          raised_by?: string | null
          raised_by_cadre_id?: string | null
          reason: string
          resolved_at?: string | null
          status?: string
          to_level?: string
        }
        Update: {
          created_at?: string
          id?: string
          problem_id?: string
          raised_by?: string | null
          raised_by_cadre_id?: string | null
          reason?: string
          resolved_at?: string | null
          status?: string
          to_level?: string
        }
        Relationships: []
      }
      gamification_events: {
        Row: {
          cadre_id: string | null
          created_at: string
          event_type: string
          id: string
          metadata: Json | null
          points_awarded: number
          problem_id: string | null
          stars_awarded: number
          team_id: string | null
        }
        Insert: {
          cadre_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          metadata?: Json | null
          points_awarded?: number
          problem_id?: string | null
          stars_awarded?: number
          team_id?: string | null
        }
        Update: {
          cadre_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          points_awarded?: number
          problem_id?: string | null
          stars_awarded?: number
          team_id?: string | null
        }
        Relationships: []
      }
      grievances: {
        Row: {
          age: number
          area: string | null
          categories: string[] | null
          city: string
          constituency: string | null
          created_at: string
          grievance: string
          id: string
          name: string
          occupation: string
          pincode: string
          polling_booth: string | null
          sentiment: string | null
          sentiment_score: number | null
          status: string | null
          sub_categories: string[] | null
          updated_at: string
        }
        Insert: {
          age: number
          area?: string | null
          categories?: string[] | null
          city: string
          constituency?: string | null
          created_at?: string
          grievance: string
          id?: string
          name: string
          occupation: string
          pincode: string
          polling_booth?: string | null
          sentiment?: string | null
          sentiment_score?: number | null
          status?: string | null
          sub_categories?: string[] | null
          updated_at?: string
        }
        Update: {
          age?: number
          area?: string | null
          categories?: string[] | null
          city?: string
          constituency?: string | null
          created_at?: string
          grievance?: string
          id?: string
          name?: string
          occupation?: string
          pincode?: string
          polling_booth?: string | null
          sentiment?: string | null
          sentiment_score?: number | null
          status?: string | null
          sub_categories?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      moderator_constituencies: {
        Row: {
          constituency: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          constituency: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          constituency?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_tokens: {
        Row: {
          constituency: string | null
          created_at: string
          department: string | null
          fcm_token: string
          id: string
          role: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          constituency?: string | null
          created_at?: string
          department?: string | null
          fcm_token: string
          id?: string
          role: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          constituency?: string | null
          created_at?: string
          department?: string | null
          fcm_token?: string
          id?: string
          role?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          constituency: string | null
          created_at: string
          data: Json | null
          department: string | null
          id: string
          read: boolean
          role: string | null
          severity: string
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          body: string
          constituency?: string | null
          created_at?: string
          data?: Json | null
          department?: string | null
          id?: string
          read?: boolean
          role?: string | null
          severity?: string
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          body?: string
          constituency?: string | null
          created_at?: string
          data?: Json | null
          department?: string | null
          id?: string
          read?: boolean
          role?: string | null
          severity?: string
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      problem_assignment_joiners: {
        Row: {
          assignment_id: string
          cadre_id: string
          id: string
          joined_at: string
        }
        Insert: {
          assignment_id: string
          cadre_id: string
          id?: string
          joined_at?: string
        }
        Update: {
          assignment_id?: string
          cadre_id?: string
          id?: string
          joined_at?: string
        }
        Relationships: []
      }
      problem_assignments: {
        Row: {
          active: boolean
          assigned_by: string | null
          cadre_id: string | null
          claimed_at: string | null
          claimed_by_cadre_id: string | null
          created_at: string
          estimated_completion_at: string | null
          id: string
          notes: string | null
          problem_id: string
          team_id: string | null
        }
        Insert: {
          active?: boolean
          assigned_by?: string | null
          cadre_id?: string | null
          claimed_at?: string | null
          claimed_by_cadre_id?: string | null
          created_at?: string
          estimated_completion_at?: string | null
          id?: string
          notes?: string | null
          problem_id: string
          team_id?: string | null
        }
        Update: {
          active?: boolean
          assigned_by?: string | null
          cadre_id?: string | null
          claimed_at?: string | null
          claimed_by_cadre_id?: string | null
          created_at?: string
          estimated_completion_at?: string | null
          id?: string
          notes?: string | null
          problem_id?: string
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "problem_assignments_cadre_id_fkey"
            columns: ["cadre_id"]
            isOneToOne: false
            referencedRelation: "cadres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "problem_assignments_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "problem_assignments_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      problem_media: {
        Row: {
          created_at: string
          id: string
          is_after_proof: boolean | null
          media_type: string
          problem_id: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_after_proof?: boolean | null
          media_type?: string
          problem_id: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_after_proof?: boolean | null
          media_type?: string
          problem_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "problem_media_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
        ]
      }
      problem_supporters: {
        Row: {
          created_at: string
          id: string
          problem_id: string
          supporter_name: string | null
          supporter_phone: string
        }
        Insert: {
          created_at?: string
          id?: string
          problem_id: string
          supporter_name?: string | null
          supporter_phone: string
        }
        Update: {
          created_at?: string
          id?: string
          problem_id?: string
          supporter_name?: string | null
          supporter_phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "problem_supporters_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
        ]
      }
      problem_updates: {
        Row: {
          after_url: string | null
          before_url: string | null
          created_at: string
          id: string
          note: string | null
          problem_id: string
          proof_url: string | null
          status: string
          updated_by: string | null
        }
        Insert: {
          after_url?: string | null
          before_url?: string | null
          created_at?: string
          id?: string
          note?: string | null
          problem_id: string
          proof_url?: string | null
          status: string
          updated_by?: string | null
        }
        Update: {
          after_url?: string | null
          before_url?: string | null
          created_at?: string
          id?: string
          note?: string | null
          problem_id?: string
          proof_url?: string | null
          status?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "problem_updates_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
        ]
      }
      problems: {
        Row: {
          address_line: string | null
          area: string | null
          assigned_to: string | null
          category: string
          citizen_confirmed: boolean | null
          city: string
          constituency: string | null
          created_at: string
          department: string
          description: string
          id: string
          latitude: number | null
          longitude: number | null
          master_problem_id: string | null
          pincode: string
          polling_booth: string | null
          reporter_age: number | null
          reporter_name: string
          reporter_phone: string
          resolved_at: string | null
          satisfaction_rating: number | null
          sentiment: string | null
          severity: string | null
          status: string
          support_count: number
          ticket_no: string
          title: string
          updated_at: string
          urgency: string
        }
        Insert: {
          address_line?: string | null
          area?: string | null
          assigned_to?: string | null
          category: string
          citizen_confirmed?: boolean | null
          city: string
          constituency?: string | null
          created_at?: string
          department: string
          description: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          master_problem_id?: string | null
          pincode: string
          polling_booth?: string | null
          reporter_age?: number | null
          reporter_name: string
          reporter_phone: string
          resolved_at?: string | null
          satisfaction_rating?: number | null
          sentiment?: string | null
          severity?: string | null
          status?: string
          support_count?: number
          ticket_no?: string
          title: string
          updated_at?: string
          urgency?: string
        }
        Update: {
          address_line?: string | null
          area?: string | null
          assigned_to?: string | null
          category?: string
          citizen_confirmed?: boolean | null
          city?: string
          constituency?: string | null
          created_at?: string
          department?: string
          description?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          master_problem_id?: string | null
          pincode?: string
          polling_booth?: string | null
          reporter_age?: number | null
          reporter_name?: string
          reporter_phone?: string
          resolved_at?: string | null
          satisfaction_rating?: number | null
          sentiment?: string | null
          severity?: string | null
          status?: string
          support_count?: number
          ticket_no?: string
          title?: string
          updated_at?: string
          urgency?: string
        }
        Relationships: [
          {
            foreignKeyName: "problems_master_problem_id_fkey"
            columns: ["master_problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      satisfaction_surveys: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          problem_id: string
          rating: number
          resolution_quality: number | null
          speed: number | null
          staff_behavior: number | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          problem_id: string
          rating: number
          resolution_quality?: number | null
          speed?: number | null
          staff_behavior?: number | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          problem_id?: string
          rating?: number
          resolution_quality?: number | null
          speed?: number | null
          staff_behavior?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "satisfaction_surveys_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
        ]
      }
      sla_targets: {
        Row: {
          category: string | null
          created_at: string
          department: string
          hours_to_acknowledge: number
          hours_to_resolve: number
          id: string
          urgency: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          department: string
          hours_to_acknowledge?: number
          hours_to_resolve?: number
          id?: string
          urgency?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          department?: string
          hours_to_acknowledge?: number
          hours_to_resolve?: number
          id?: string
          urgency?: string
        }
        Relationships: []
      }
      sms_log: {
        Row: {
          created_at: string
          error: string | null
          id: string
          idempotency_key: string | null
          message: string
          problem_id: string | null
          provider_sid: string | null
          recipient_phone: string
          sent_at: string | null
          status: string
          trigger_code: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          idempotency_key?: string | null
          message: string
          problem_id?: string | null
          provider_sid?: string | null
          recipient_phone: string
          sent_at?: string | null
          status?: string
          trigger_code: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          idempotency_key?: string | null
          message?: string
          problem_id?: string | null
          provider_sid?: string | null
          recipient_phone?: string
          sent_at?: string | null
          status?: string
          trigger_code?: string
        }
        Relationships: []
      }
      social_posts: {
        Row: {
          author_id: string | null
          author_name: string | null
          body: string
          category: string | null
          city: string | null
          constituency: string | null
          created_at: string
          id: string
          image_url: string | null
          pinned: boolean | null
          title: string | null
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          body: string
          category?: string | null
          city?: string | null
          constituency?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          pinned?: boolean | null
          title?: string | null
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          body?: string
          category?: string | null
          city?: string | null
          constituency?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          pinned?: boolean | null
          title?: string | null
        }
        Relationships: []
      }
      suggestions: {
        Row: {
          age: number
          area: string | null
          categories: string[]
          city: string
          constituency: string | null
          created_at: string
          id: string
          name: string
          occupation: string
          pincode: string
          polling_booth: string | null
          sentiment: string | null
          sentiment_score: number | null
          sub_categories: string[]
          suggestion: string
          updated_at: string
        }
        Insert: {
          age: number
          area?: string | null
          categories?: string[]
          city: string
          constituency?: string | null
          created_at?: string
          id?: string
          name: string
          occupation: string
          pincode: string
          polling_booth?: string | null
          sentiment?: string | null
          sentiment_score?: number | null
          sub_categories?: string[]
          suggestion: string
          updated_at?: string
        }
        Update: {
          age?: number
          area?: string | null
          categories?: string[]
          city?: string
          constituency?: string | null
          created_at?: string
          id?: string
          name?: string
          occupation?: string
          pincode?: string
          polling_booth?: string | null
          sentiment?: string | null
          sentiment_score?: number | null
          sub_categories?: string[]
          suggestion?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          added_at: string
          cadre_id: string
          id: string
          role_in_team: string | null
          team_id: string
        }
        Insert: {
          added_at?: string
          cadre_id: string
          id?: string
          role_in_team?: string | null
          team_id: string
        }
        Update: {
          added_at?: string
          cadre_id?: string
          id?: string
          role_in_team?: string | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_cadre_id_fkey"
            columns: ["cadre_id"]
            isOneToOne: false
            referencedRelation: "cadres"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_postings: {
        Row: {
          area: string | null
          cadre_id: string
          created_at: string
          created_by: string | null
          ends_at: string | null
          id: string
          notes: string | null
          posting_title: string
          posting_type: string
          starts_at: string
          team_id: string
        }
        Insert: {
          area?: string | null
          cadre_id: string
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          id?: string
          notes?: string | null
          posting_title: string
          posting_type?: string
          starts_at?: string
          team_id: string
        }
        Update: {
          area?: string | null
          cadre_id?: string
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          id?: string
          notes?: string | null
          posting_title?: string
          posting_type?: string
          starts_at?: string
          team_id?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          active: boolean
          city: string | null
          constituency: string | null
          created_at: string
          department: string | null
          description: string | null
          id: string
          lead_cadre_id: string | null
          name: string
          points: number
          resolved_count: number
          stars: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          city?: string | null
          constituency?: string | null
          created_at?: string
          department?: string | null
          description?: string | null
          id?: string
          lead_cadre_id?: string | null
          name: string
          points?: number
          resolved_count?: number
          stars?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          city?: string | null
          constituency?: string | null
          created_at?: string
          department?: string | null
          description?: string | null
          id?: string
          lead_cadre_id?: string | null
          name?: string
          points?: number
          resolved_count?: number
          stars?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_lead_cadre_id_fkey"
            columns: ["lead_cadre_id"]
            isOneToOne: false
            referencedRelation: "cadres"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      volunteers: {
        Row: {
          area: string | null
          availability: string | null
          city: string
          constituency: string | null
          created_at: string
          id: string
          interests: string[] | null
          name: string
          phone: string
          polling_booth: string | null
          submission_id: string | null
          submission_type: string | null
          updated_at: string
        }
        Insert: {
          area?: string | null
          availability?: string | null
          city: string
          constituency?: string | null
          created_at?: string
          id?: string
          interests?: string[] | null
          name: string
          phone: string
          polling_booth?: string | null
          submission_id?: string | null
          submission_type?: string | null
          updated_at?: string
        }
        Update: {
          area?: string | null
          availability?: string | null
          city?: string
          constituency?: string | null
          created_at?: string
          id?: string
          interests?: string[] | null
          name?: string
          phone?: string
          polling_booth?: string | null
          submission_id?: string | null
          submission_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      mv_city_problem_counts: {
        Row: {
          city: string | null
          pending: number | null
          resolved: number | null
          total: number | null
        }
        Relationships: []
      }
      mv_constituency_problem_counts: {
        Row: {
          constituency: string | null
          pending: number | null
          resolved: number | null
          total: number | null
        }
        Relationships: []
      }
      mv_public_stats: {
        Row: {
          cadres_count: number | null
          grievances_count: number | null
          problems_count: number | null
          refreshed_at: string | null
          resolved_count: number | null
          suggestions_count: number | null
          volunteers_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_current_cadre_access_assignment: {
        Args: { _problem_id: string }
        Returns: boolean
      }
      compute_tier: { Args: { _points: number }; Returns: string }
      current_cadre_id: { Args: never; Returns: string }
      current_officer_department: { Args: never; Returns: string }
      enqueue_email: {
        Args: { _problem_id: string; _trigger: string }
        Returns: number
      }
      enqueue_sms: {
        Args: { _problem_id: string; _trigger: string }
        Returns: number
      }
      get_cadre_leaderboard: {
        Args: { _constituency?: string; _limit?: number }
        Returns: {
          city: string
          constituency: string
          id: string
          level: string
          name: string
          points: number
          profile_photo_url: string
          rank_tier: string
          resolved_count: number
          stars: number
        }[]
      }
      get_city_breakdown: {
        Args: { _city: string }
        Returns: {
          category: string
          resolved: number
          total: number
        }[]
      }
      get_city_problem_counts: {
        Args: never
        Returns: {
          city: string
          pending: number
          resolved: number
          total: number
        }[]
      }
      get_constituency_breakdown: {
        Args: { _constituency: string }
        Returns: {
          category: string
          resolved: number
          total: number
        }[]
      }
      get_constituency_problem_counts: {
        Args: never
        Returns: {
          constituency: string
          pending: number
          resolved: number
          total: number
        }[]
      }
      get_notification_recipients: {
        Args: { _problem_id: string; _trigger: string }
        Returns: {
          email: string
          role: string
        }[]
      }
      get_public_cadres: {
        Args: { _constituency?: string }
        Returns: {
          area: string
          city: string
          constituency: string
          id: string
          level: string
          name: string
          phone: string
          profile_photo_url: string
          public_role_label: string
          role_title: string
          show_phone: boolean
          ward_number: string
        }[]
      }
      get_public_stats: {
        Args: never
        Returns: {
          cadres_count: number
          grievances_count: number
          problems_count: number
          resolved_count: number
          suggestions_count: number
          volunteers_count: number
        }[]
      }
      get_team_leaderboard: {
        Args: { _constituency?: string; _limit?: number }
        Returns: {
          city: string
          constituency: string
          department: string
          id: string
          name: string
          points: number
          resolved_count: number
          stars: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_current_cadre_in_team: { Args: { _team_id: string }; Returns: boolean }
      is_current_cadre_teammate: {
        Args: { _cadre_id: string }
        Returns: boolean
      }
      refresh_map_stats: { Args: never; Returns: undefined }
      refresh_public_stats: { Args: never; Returns: undefined }
      submit_corruption_report: {
        Args: {
          _amount_demanded?: number
          _area?: string
          _city?: string
          _confirmed_good_faith?: boolean
          _constituency?: string
          _department?: string
          _description?: string
          _evidence_url?: string
          _evidence_urls?: string[]
          _incident_date?: string
          _incident_time?: string
          _incident_type?: string
          _office_location?: string
          _person_involved?: string
          _person_name?: string
        }
        Returns: {
          ticket_no: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "cadre" | "department"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user", "cadre", "department"],
    },
  },
} as const
