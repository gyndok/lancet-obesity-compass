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
    const { patientData } = await req.json();

    if (!patientData || typeof patientData !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Patient data text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Parsing patient data with AI...');

    const systemPrompt = `You are a medical data extraction assistant. Extract structured patient data from the provided text.
    
Return a JSON object with the following structure (only include fields that are found in the text):
{
  "demographics": {
    "age": number or null,
    "sex": "male" or "female" or null,
    "ethnicity": "caucasian" | "african-american" | "hispanic" | "asian" | "other" or null
  },
  "measurements": {
    "heightFeet": number or null,
    "heightInches": number or null,
    "heightTotalInches": number or null,
    "weight": number or null
  },
  "symptoms": {
    "breathlessness": boolean,
    "fatigue": boolean,
    "chronicPain": boolean,
    "urinaryIncontinence": boolean,
    "reflux": boolean,
    "sleepDisorders": boolean,
    "mentalHealth": boolean
  },
  "medicalHistory": {
    "type2Diabetes": boolean,
    "pcos": boolean,
    "hypertension": boolean,
    "cardiovascularDisease": boolean,
    "sleepApnea": boolean,
    "nafld": boolean,
    "osteoarthritis": boolean
  },
  "functionalLimitations": {
    "mobilityLimitations": boolean,
    "bathingDifficulty": boolean,
    "dressingDifficulty": boolean,
    "toiletingDifficulty": boolean,
    "continenceDifficulty": boolean,
    "eatingDifficulty": boolean
  }
}

Only extract data that is explicitly mentioned or clearly implied in the text. Set boolean values to true only if the condition is present.
Return ONLY valid JSON, no additional text or explanation.`;

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
          { role: "user", content: `Extract patient data from the following text:\n\n${patientData}` }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
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

    console.log('AI response:', content);

    // Parse the JSON from the AI response
    let parsedData;
    try {
      // Remove any markdown code blocks if present
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      parsedData = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      throw new Error('Failed to parse extracted data');
    }

    console.log('Parsed patient data:', parsedData);

    return new Response(JSON.stringify({ success: true, data: parsedData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error parsing patient data:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to parse patient data' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
