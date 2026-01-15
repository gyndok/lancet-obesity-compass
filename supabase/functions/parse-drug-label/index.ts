import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { rawText } = await req.json();

    if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Raw text content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are a pharmaceutical data extraction assistant. Extract structured medication data from drug label text, prescribing information, or clinical documentation.

Return a JSON object with the following structure (include all fields, use null or empty arrays for missing data):

{
  "generic_name": "string - The generic/chemical name of the drug",
  "brand_names": ["array of brand name strings"],
  "drug_class": "string - Pharmacological class (e.g., 'GLP-1 receptor agonist', 'Lipase inhibitor')",
  "route": "oral" | "weekly_injection" | "daily_injection" | "other",
  "moa_short": "string - Brief 1-sentence mechanism of action",
  "moa_long": "string - Detailed mechanism of action explanation",
  "dosing_summary": "string - Dosing instructions and typical regimen",
  "titration_schedule": [
    {"week": 1, "dose": "string", "notes": "optional string"},
    ...
  ],
  "missed_dose_rules": "string or null - Instructions for missed doses",
  "contraindications": ["array of contraindication strings"],
  "boxed_warning": "string or null - FDA boxed warning text if present",
  "serious_warnings": ["array of serious warning strings"],
  "common_adverse_effects": ["array of common side effects (>5% incidence)"],
  "serious_adverse_effects": ["array of serious/rare adverse effects"],
  "interactions": ["array of drug interaction strings"],
  "pregnancy_lactation": {
    "pregnancy_category": "string or null",
    "pregnancy_notes": "string or null",
    "lactation_notes": "string or null",
    "contraindicated": boolean
  },
  "renal_adjustment": "string or null - Dosing adjustments for renal impairment",
  "hepatic_adjustment": "string or null - Dosing adjustments for hepatic impairment",
  "monitoring": {
    "frequency": "string or null",
    "parameters": ["array of monitoring parameter strings"],
    "notes": "string or null"
  },
  "efficacy": {
    "timepoint_months": number or null,
    "mean_tbwl_percent": number or null - For weight loss drugs, mean total body weight loss %,
    "range_tbwl_percent": "string or null",
    "key_trial_name": "string or null"
  },
  "patient_counseling": "string or null - Key counseling points",
  "comorbidity_fit_tags": ["array of conditions this drug is good for, e.g., 'type2-diabetes', 'hypertension', 'pcos'"]
}

Extract all available information. For anti-obesity medications, pay special attention to:
- Weight loss efficacy data from clinical trials
- Titration schedules
- GI adverse effects
- Cardiovascular safety data
- Thyroid warnings (for GLP-1s)

Return ONLY valid JSON, no additional text or explanation.`;

    console.log('Parsing drug label text, length:', rawText.length);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Extract medication data from the following text:\n\n${rawText.substring(0, 50000)}` }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    console.log('AI extraction complete');

    // Parse the JSON from the AI response
    let parsedData;
    try {
      // Remove any markdown code blocks if present
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      parsedData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Raw content:', content);
      throw new Error('Failed to parse extracted medication data');
    }

    console.log('Successfully parsed medication:', parsedData.generic_name);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: parsedData,
        meta: {
          source: 'AI extraction',
          extracted_at: new Date().toISOString(),
          input_length: rawText.length,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error parsing drug label:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to parse drug label' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
