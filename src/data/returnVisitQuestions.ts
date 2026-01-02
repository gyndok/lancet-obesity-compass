import { Question } from "@/types/interview";

export const returnVisitQuestions: Question[] = [
  // Visit Information
  { id: 1, section: "Visit Information", question: "Visit Date", type: "date" },
  { id: 2, section: "Visit Information", question: "Current Weight (lbs)", type: "number" },
  
  // Weight History & Progress
  { id: 3, section: "Weight History & Progress", question: "Previous weights and dates (one per line: MM/DD/YYYY - weight)", type: "textarea" },
  
  // Current Medication
  { id: 4, section: "Current Medication", question: "Current Weight Loss Medication", type: "text" },
  { id: 5, section: "Current Medication", question: "Current Dose", type: "text" },
  { id: 6, section: "Current Medication", question: "How long at this dose?", type: "text" },
  
  // Side Effects & Tolerance
  { id: 7, section: "Side Effects & Tolerance", question: "Any side effects experienced?", type: "checkbox", options: ["Nausea", "Vomiting", "Diarrhea", "Constipation", "Headache", "Fatigue", "Dizziness", "None"] },
  { id: 8, section: "Side Effects & Tolerance", question: "Side effects details (severity, frequency, management)", type: "textarea" },
  { id: 9, section: "Side Effects & Tolerance", question: "How well is appetite controlled? (1-10, 10=excellent)", type: "number" },
  
  // Diet & Nutrition
  { id: 10, section: "Diet & Nutrition", question: "Daily calorie intake (average)", type: "number" },
  { id: 11, section: "Diet & Nutrition", question: "Macros - Protein (grams/day)", type: "number" },
  { id: 12, section: "Diet & Nutrition", question: "Macros - Carbs (grams/day)", type: "number" },
  { id: 13, section: "Diet & Nutrition", question: "Macros - Fats (grams/day)", type: "number" },
  { id: 14, section: "Diet & Nutrition", question: "Has patient met with dietitian?", type: "radio", options: ["Yes", "No", "Scheduled"] },
  { id: 15, section: "Diet & Nutrition", question: "Dietitian consultation notes", type: "textarea" },
  
  // Exercise & Activity
  { id: 16, section: "Exercise & Activity", question: "Current exercise routine (frequency and type)", type: "textarea" },
  { id: 17, section: "Exercise & Activity", question: "Minutes of exercise per week", type: "number" },
  
  // Labs & Measurements
  { id: 18, section: "Labs & Measurements", question: "Recent labs ordered/reviewed?", type: "radio", options: ["Yes", "No", "Pending"] },
  { id: 19, section: "Labs & Measurements", question: "Lab results and notes", type: "textarea" },
  { id: 20, section: "Labs & Measurements", question: "Body composition - Body Fat %", type: "number" },
  { id: 21, section: "Labs & Measurements", question: "Body composition - Muscle Mass (lbs or %)", type: "text" },
  
  // Clinical Assessment
  { id: 22, section: "Clinical Assessment", question: "Blood pressure", type: "text" },
  { id: 23, section: "Clinical Assessment", question: "Heart rate", type: "number" },
  { id: 24, section: "Clinical Assessment", question: "Any new medical concerns or conditions?", type: "textarea" },
  
  // Plan & Recommendations
  { id: 25, section: "Plan & Recommendations", question: "Medication plan (continue, increase, decrease, change)", type: "radio", options: ["Continue current dose", "Increase dose", "Decrease dose", "Change medication", "Discontinue"] },
  { id: 26, section: "Plan & Recommendations", question: "New medication/dose if changing", type: "text" },
  { id: 27, section: "Plan & Recommendations", question: "Provider notes and recommendations", type: "textarea" },
  { id: 28, section: "Plan & Recommendations", question: "Patient questions and concerns", type: "textarea" },
  { id: 29, section: "Plan & Recommendations", question: "Follow-up plan (when to return)", type: "text" },
  { id: 30, section: "Plan & Recommendations", question: "Additional notes", type: "textarea" }
];
