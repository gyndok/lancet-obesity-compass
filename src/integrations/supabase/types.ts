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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      formulary_rules: {
        Row: {
          created_at: string
          id: string
          last_verified_at: string | null
          payer_name: string
          rule_set: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_verified_at?: string | null
          payer_name: string
          rule_set?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_verified_at?: string | null
          payer_name?: string
          rule_set?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      medication_change_log: {
        Row: {
          after_snapshot: Json | null
          before_snapshot: Json | null
          change_summary: string
          changed_at: string
          changed_by: string | null
          id: string
          medication_id: string
        }
        Insert: {
          after_snapshot?: Json | null
          before_snapshot?: Json | null
          change_summary: string
          changed_at?: string
          changed_by?: string | null
          id?: string
          medication_id: string
        }
        Update: {
          after_snapshot?: Json | null
          before_snapshot?: Json | null
          change_summary?: string
          changed_at?: string
          changed_by?: string | null
          id?: string
          medication_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_change_log_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          boxed_warning: string | null
          brand_names: string[] | null
          common_adverse_effects: string[] | null
          comorbidity_fit_tags: string[] | null
          contraindications: string[] | null
          created_at: string
          dosing_summary: string | null
          drug_class: string
          efficacy: Json | null
          generic_name: string
          hepatic_adjustment: string | null
          icd10_suggestions: string[] | null
          id: string
          interactions: string[] | null
          is_active: boolean
          label_imported_at: string | null
          label_set_id: string | null
          last_reviewed_at: string | null
          med_references: Json | null
          missed_dose_rules: string | null
          moa_long: string | null
          moa_short: string | null
          monitoring: Json | null
          pa_template: string | null
          patient_counseling: string | null
          pregnancy_lactation: Json | null
          raw_label_data: Json | null
          renal_adjustment: string | null
          route: Database["public"]["Enums"]["medication_route"]
          serious_adverse_effects: string[] | null
          serious_warnings: string[] | null
          titration_schedule: Json | null
          updated_at: string
          version: number
        }
        Insert: {
          boxed_warning?: string | null
          brand_names?: string[] | null
          common_adverse_effects?: string[] | null
          comorbidity_fit_tags?: string[] | null
          contraindications?: string[] | null
          created_at?: string
          dosing_summary?: string | null
          drug_class: string
          efficacy?: Json | null
          generic_name: string
          hepatic_adjustment?: string | null
          icd10_suggestions?: string[] | null
          id?: string
          interactions?: string[] | null
          is_active?: boolean
          label_imported_at?: string | null
          label_set_id?: string | null
          last_reviewed_at?: string | null
          med_references?: Json | null
          missed_dose_rules?: string | null
          moa_long?: string | null
          moa_short?: string | null
          monitoring?: Json | null
          pa_template?: string | null
          patient_counseling?: string | null
          pregnancy_lactation?: Json | null
          raw_label_data?: Json | null
          renal_adjustment?: string | null
          route?: Database["public"]["Enums"]["medication_route"]
          serious_adverse_effects?: string[] | null
          serious_warnings?: string[] | null
          titration_schedule?: Json | null
          updated_at?: string
          version?: number
        }
        Update: {
          boxed_warning?: string | null
          brand_names?: string[] | null
          common_adverse_effects?: string[] | null
          comorbidity_fit_tags?: string[] | null
          contraindications?: string[] | null
          created_at?: string
          dosing_summary?: string | null
          drug_class?: string
          efficacy?: Json | null
          generic_name?: string
          hepatic_adjustment?: string | null
          icd10_suggestions?: string[] | null
          id?: string
          interactions?: string[] | null
          is_active?: boolean
          label_imported_at?: string | null
          label_set_id?: string | null
          last_reviewed_at?: string | null
          med_references?: Json | null
          missed_dose_rules?: string | null
          moa_long?: string | null
          moa_short?: string | null
          monitoring?: Json | null
          pa_template?: string | null
          patient_counseling?: string | null
          pregnancy_lactation?: Json | null
          raw_label_data?: Json | null
          renal_adjustment?: string | null
          route?: Database["public"]["Enums"]["medication_route"]
          serious_adverse_effects?: string[] | null
          serious_warnings?: string[] | null
          titration_schedule?: Json | null
          updated_at?: string
          version?: number
        }
        Relationships: []
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
          role?: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "clinician" | "user"
      medication_route:
        | "oral"
        | "weekly_injection"
        | "daily_injection"
        | "other"
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
      app_role: ["admin", "clinician", "user"],
      medication_route: [
        "oral",
        "weekly_injection",
        "daily_injection",
        "other",
      ],
    },
  },
} as const
