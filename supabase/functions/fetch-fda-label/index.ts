import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OpenFDALabelResult {
  openfda?: {
    generic_name?: string[];
    brand_name?: string[];
    product_type?: string[];
    route?: string[];
    manufacturer_name?: string[];
  };
  indications_and_usage?: string[];
  dosage_and_administration?: string[];
  contraindications?: string[];
  warnings_and_cautions?: string[];
  boxed_warning?: string[];
  adverse_reactions?: string[];
  drug_interactions?: string[];
  use_in_specific_populations?: string[];
  pregnancy?: string[];
  nursing_mothers?: string[];
  set_id?: string;
  effective_time?: string;
}

interface ParsedMedication {
  generic_name: string;
  brand_names: string[];
  drug_class: string;
  route: 'oral' | 'weekly_injection' | 'daily_injection' | 'other';
  moa_short: string;
  moa_long: string;
  dosing_summary: string;
  contraindications: string[];
  boxed_warning: string | null;
  serious_warnings: string[];
  common_adverse_effects: string[];
  serious_adverse_effects: string[];
  interactions: string[];
  pregnancy_lactation: {
    pregnancy_notes?: string;
    lactation_notes?: string;
  };
  patient_counseling: string;
  label_set_id: string;
  raw_label_data: OpenFDALabelResult;
  med_references: Array<{
    title: string;
    source_name: string;
    url: string;
    accessed_date: string;
  }>;
}

function parseRoute(routes: string[] | undefined): 'oral' | 'weekly_injection' | 'daily_injection' | 'other' {
  if (!routes || routes.length === 0) return 'other';
  const routeStr = routes[0].toLowerCase();
  if (routeStr.includes('oral')) return 'oral';
  if (routeStr.includes('subcutaneous') || routeStr.includes('injection')) {
    // Check dosing for weekly vs daily - default to other for now
    return 'other';
  }
  return 'other';
}

function extractList(text: string | undefined): string[] {
  if (!text) return [];
  // Split by bullet points, numbered lists, or newlines
  const items = text
    .split(/(?:•|\d+\.|[\n\r]+)/)
    .map(s => s.trim())
    .filter(s => s.length > 10 && s.length < 500);
  return items.slice(0, 15); // Limit to 15 items
}

function truncateText(text: string | undefined, maxLength: number = 2000): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

function parseLabelData(data: OpenFDALabelResult): ParsedMedication {
  const genericName = data.openfda?.generic_name?.[0] || 'Unknown';
  const brandNames = data.openfda?.brand_name || [];
  
  const today = new Date().toISOString().split('T')[0];
  
  return {
    generic_name: genericName.charAt(0).toUpperCase() + genericName.slice(1).toLowerCase(),
    brand_names: brandNames.map(b => b.charAt(0).toUpperCase() + b.slice(1).toLowerCase()),
    drug_class: 'Anti-obesity medication', // Will need manual entry
    route: parseRoute(data.openfda?.route),
    moa_short: '', // Not in FDA label, needs manual entry
    moa_long: '',
    dosing_summary: truncateText(data.dosage_and_administration?.[0]),
    contraindications: extractList(data.contraindications?.[0]),
    boxed_warning: data.boxed_warning?.[0] || null,
    serious_warnings: extractList(data.warnings_and_cautions?.[0]),
    common_adverse_effects: [], // Will need manual curation from adverse_reactions
    serious_adverse_effects: extractList(data.adverse_reactions?.[0]).slice(0, 10),
    interactions: extractList(data.drug_interactions?.[0]),
    pregnancy_lactation: {
      pregnancy_notes: truncateText(data.pregnancy?.[0] || data.use_in_specific_populations?.[0], 1000),
      lactation_notes: truncateText(data.nursing_mothers?.[0], 500),
    },
    patient_counseling: truncateText(data.indications_and_usage?.[0], 1000),
    label_set_id: data.set_id || '',
    raw_label_data: data,
    med_references: [
      {
        title: `${genericName} FDA Prescribing Information`,
        source_name: 'FDA / DailyMed',
        url: data.set_id 
          ? `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${data.set_id}`
          : 'https://dailymed.nlm.nih.gov/dailymed/',
        accessed_date: today,
      }
    ],
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { searchTerm, setId } = await req.json();
    
    if (!searchTerm && !setId) {
      return new Response(
        JSON.stringify({ error: 'Either searchTerm or setId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let url: string;
    if (setId) {
      // Search by SET ID
      url = `https://api.fda.gov/drug/label.json?search=set_id:"${encodeURIComponent(setId)}"&limit=1`;
    } else {
      // Search by generic or brand name
      const term = encodeURIComponent(searchTerm);
      url = `https://api.fda.gov/drug/label.json?search=(openfda.generic_name:"${term}"+OR+openfda.brand_name:"${term}")&limit=5`;
    }

    console.log('Fetching from openFDA:', url);

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return new Response(
          JSON.stringify({ error: 'No matching medications found in FDA database', results: [] }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`openFDA API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No matching medications found', results: [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse each result
    const parsedResults = data.results.map((result: OpenFDALabelResult) => parseLabelData(result));

    return new Response(
      JSON.stringify({ 
        results: parsedResults,
        meta: {
          total: data.meta?.results?.total || parsedResults.length,
          source: 'openFDA Drug Labeling API',
          fetched_at: new Date().toISOString(),
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching FDA label:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to fetch FDA label data' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
