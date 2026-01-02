import { Question } from "@/types/interview";

export const initialVisitQuestions: Question[] = [
  // Patient Demographics
  { id: 1, section: "Patient Demographics", question: "Patient age (years)?", type: "number" },
  { id: 2, section: "Patient Demographics", question: "Patient sex?", type: "radio", options: ["Male", "Female"] },
  { id: 53, section: "Patient Demographics", question: "Patient ethnicity?", type: "dropdown", options: ["Caucasian", "African American", "Hispanic/Latino", "Asian", "Other"] },

  // Introduction & Verification
  { id: 3, section: "Introduction & Verification", question: "Primary goal for this visit?", type: "textarea" },
  { id: 4, section: "Introduction & Verification", question: "Does the patient have a primary care provider?", type: "radio", options: ["Yes", "No"] },
  
  // Weight History
  { 
    id: 5, 
    section: "Weight History", 
    question: "Tell me the story of your weight", 
    description: "Age when the problem began, triggers for weight gain, highest adult weight, lowest adult weight, remedies for prior weight loss attempts",
    type: "textarea" 
  },
  { id: 52, section: "Weight History", question: "What is your personal weight loss goal (lbs)?", type: "number" },
  
  // Medications & Allergies
  { id: 11, section: "Medications & Allergies", question: "Current medications?", type: "textarea" },
  { id: 12, section: "Medications & Allergies", question: "Allergies?", type: "text" },
  { id: 13, section: "Medications & Allergies", question: "Any known weight-promoting medications?", type: "radio", options: ["Yes", "No", "Unsure"] },
  
  // Contraindication Screening
  { id: 14, section: "Contraindication Screening", question: "History of Medullary Thyroid Carcinoma (MTC)?", type: "radio", options: ["Yes", "No"] },
  { id: 15, section: "Contraindication Screening", question: "History of MEN2?", type: "radio", options: ["Yes", "No"] },
  { id: 16, section: "Contraindication Screening", question: "Family history of medullary thyroid cancer or MEN2?", type: "radio", options: ["Yes", "No"] },
  { id: 17, section: "Contraindication Screening", question: "Any history of pancreatitis, gastroparesis, or gallbladder disease?", type: "checkbox", options: ["Pancreatitis", "Gastroparesis", "Gallbladder disease", "None"] },
  { id: 18, section: "Contraindication Screening", question: "Any GI symptoms (reflux, nausea, etc.)?", type: "text" },
  { id: 19, section: "Contraindication Screening", question: "Is the patient using contraception or planning pregnancy soon?", type: "text" },
  { id: 20, section: "Contraindication Screening", question: "Does the patient have diabetes and use insulin?", type: "radio", options: ["Yes", "No"] },
  
  // Medical History
  { id: 21, section: "Medical History", question: "Other medical conditions or surgeries?", type: "textarea" },
  { id: 22, section: "Medical History", question: "Mental health concerns?", type: "textarea" },
  { id: 23, section: "Medical History", question: "Family history (obesity, thyroid, metabolic issues)?", type: "textarea" },

  // Functional Limitations
  { id: 54, section: "Functional Limitations", question: "Does the patient experience any limitations in Activities of Daily Living (ADL)?", type: "checkbox", options: ["Mobility Limitations", "Bathing Difficulty", "Dressing Difficulty", "Toileting Difficulty", "Continence Issues", "Eating Difficulty", "None"] },

  // Current Symptoms
  { id: 55, section: "Current Symptoms", question: "Does the patient have any respiratory or exercise-related symptoms?", type: "checkbox", options: ["Breathlessness/Dyspnea", "Chronic Fatigue", "None"] },
  { id: 56, section: "Current Symptoms", question: "Does the patient have any physical symptoms?", type: "checkbox", options: ["Chronic Pain", "Urinary Incontinence", "Gastroesophageal Reflux (GERD)", "None"] },
  { id: 57, section: "Current Symptoms", question: "Does the patient have any sleep or mental health concerns?", type: "checkbox", options: ["Sleep Disorders", "Mental Health Issues (Depression/Anxiety)", "None"] },

  // Past Medical History (Clinical)
  { id: 58, section: "Past Medical History", question: "Does the patient have any metabolic or endocrine conditions?", type: "checkbox", options: ["Type 2 Diabetes", "Polycystic Ovary Syndrome (PCOS)", "None"] },
  { id: 59, section: "Past Medical History", question: "Does the patient have any cardiovascular conditions?", type: "checkbox", options: ["Hypertension", "Cardiovascular Disease", "None"] },
  { id: 60, section: "Past Medical History", question: "Does the patient have any of these other conditions?", type: "checkbox", options: ["Sleep Apnea", "NAFLD/NASH", "Osteoarthritis", "None"] },

  // Lifestyle
  { id: 24, section: "Lifestyle", question: "Describe current diet briefly.", type: "textarea" },
  { id: 25, section: "Lifestyle", question: "Any food sensitivities or eating patterns?", type: "text" },
  { id: 26, section: "Lifestyle", question: "Typical daily meals?", type: "textarea" },
  { id: 27, section: "Lifestyle", question: "Current activity level?", type: "dropdown", options: ["Sedentary", "Light", "Moderate", "Vigorous"] },
  { id: 28, section: "Lifestyle", question: "Any barriers to regular exercise?", type: "text" },
  { id: 29, section: "Lifestyle", question: "How many times per week does the patient do strength training?", type: "number" },
  { id: 30, section: "Lifestyle", question: "Average sleep hours per night?", type: "number" },
  { id: 31, section: "Lifestyle", question: "Sleep quality concerns (snoring, daytime sleepiness)?", type: "text" },
  { id: 32, section: "Lifestyle", question: "Mood or stress issues to note?", type: "text" },
  { id: 33, section: "Lifestyle", question: "Alcohol use?", type: "text" },
  { id: 34, section: "Lifestyle", question: "Tobacco/vaping/substance use?", type: "text" },
  
  // Medication Preferences
  { id: 35, section: "Medication Preferences", question: "Previously used GLP-1 medications?", type: "radio", options: ["Yes", "No"] },
  { id: 36, section: "Medication Preferences", question: "Preferred medication?", type: "dropdown", options: ["Semaglutide", "Tirzepatide", "Open to either"] },
  { id: 37, section: "Medication Preferences", question: "Additional details about medication preference?", type: "textarea" },
  { id: 38, section: "Medication Preferences", question: "Any concern about compounded options?", type: "radio", options: ["Yes", "No"] },
  
  // Medication Education & Counseling
  { id: 39, section: "Medication Education & Counseling", question: "GLP-1 warnings and contraindications discussed?", type: "checkbox", options: ["Thyroid C-cell tumor risk (MTC/MEN2)", "Severe stomach problems", "Kidney problems/dehydration", "Gallbladder problems", "Pancreatitis", "Serious allergic reactions", "Hypoglycemia risk", "Vision changes", "Tachycardia", "Depression/suicidal thoughts", "Birth control interaction"] },
  { id: 40, section: "Medication Education & Counseling", question: "Common side effects reviewed (nausea, diarrhea, vomiting, constipation, injection site reactions, etc.)?", type: "radio", options: ["Yes", "No"] },
  { id: 41, section: "Medication Education & Counseling", question: "Patient questions or concerns about medication risks?", type: "textarea" },
  { id: 42, section: "Medication Education & Counseling", question: "Patient verbalized understanding of risks and benefits?", type: "radio", options: ["Yes", "No", "Partial understanding - requires follow-up"] },
  
  // Plan & Follow-Up
  { id: 43, section: "Plan & Follow-Up", question: "Selected medication and starting dose?", type: "text" },
  { id: 44, section: "Plan & Follow-Up", question: "Labs ordered?", type: "checkbox", options: ["A1C", "Comprehensive metabolic panel", "TSH", "Lipid panel", "Patient had done at PCP and will send to me"] },
  { id: 45, section: "Plan & Follow-Up", question: "Additional lab details or instructions?", type: "textarea" },
  { id: 46, section: "Plan & Follow-Up", question: "Body composition scan recommended?", type: "radio", options: ["Yes", "No"] },
  { id: 47, section: "Plan & Follow-Up", question: "Sleep testing ordered?", type: "radio", options: ["Yes", "No", "Suggest PCP order study", "Not applicable"] },
  { id: 48, section: "Plan & Follow-Up", question: "Dietitian referral needed?", type: "radio", options: ["Yes", "No", "Already scheduled"] },
  { id: 49, section: "Plan & Follow-Up", question: "Target weight loss goal?", type: "text" },
  { id: 50, section: "Plan & Follow-Up", question: "Follow-up interval?", type: "text" },
  { id: 51, section: "Plan & Follow-Up", question: "Additional notes or instructions?", type: "textarea" }
];

export const getUniqueSections = (questions: Question[]): string[] => {
  const sections: string[] = [];
  questions.forEach(q => {
    if (!sections.includes(q.section)) {
      sections.push(q.section);
    }
  });
  return sections;
};
