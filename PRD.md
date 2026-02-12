# Weight Clinic — Product Requirements Document (PRD)

**Purpose:** This document fully specifies the "Weight Clinic" web application so that a native macOS app (Swift/SwiftUI + local SQLite) can be built with identical behavior.

---

## 1. Product Overview

**Weight Clinic** is a clinical decision-support tool for obesity medicine practitioners. It operationalizes the **2025 Lancet Commission** obesity classification criteria, providing:

1. **Structured patient encounter interviews** (initial & return visits)
2. **Clinical obesity diagnostic assessment** (algorithmic classification)
3. **Medication formulary** with browsing, comparison, and AI-powered import

The app targets clinicians in weight management clinics. All units are **imperial** (lbs, inches, feet).

---

## 2. Application Architecture

### 2.1 Screens / Navigation

| Route | Screen | Description |
|-------|--------|-------------|
| `/` | Landing | Visit type selection + quick links |
| `/auth` | Auth | Email/password sign-in & sign-up |
| `/interview/initial` | Initial Visit Interview | Multi-phase guided interview for new patients |
| `/interview/return` | Return Visit Interview | Shorter follow-up interview |
| `/assessment` | Obesity Assessment Tool | 4-tab data entry + real-time diagnostic engine |
| `/formulary` | Formulary Browse | Searchable/filterable medication table |
| `/formulary/:id` | Medication Detail | Full drug monograph view |
| `/formulary/compare` | Medication Compare | Side-by-side comparison (up to 4) |

### 2.2 Theme

- Light/dark mode toggle (persisted)
- Design tokens: background, foreground, primary, secondary, muted, accent, destructive, success, warning, error
- All colors in HSL

---

## 3. Landing Page

### Layout
- Header: App icon (stethoscope), title "Weight Clinic", subtitle "Patient Encounter System", dark mode toggle
- Hero: "Patient Encounter Portal" heading + description
- Two cards in a 2-column grid:

#### Card 1: Initial Patient Visit
- Icon: `UserPlus`
- Label: "New Patient"
- Title: "Initial Patient Visit"
- Description: "Complete intake interview for new weight management patients"
- Bullet points: Patient data import, BMI calculation & targets, Comprehensive health history, Medication counseling & education, Treatment plan development
- Button: "Start Initial Visit"

#### Card 2: Return Visit
- Icon: `UserCheck`  
- Label: "Existing Patient"
- Title: "Return Visit"
- Description: "Follow-up interview for established patients"
- Bullet points: Weight progress tracking, Medication review & adjustment, Side effects assessment, Diet & exercise evaluation, Lab review & clinical notes
- Button: "Start Return Visit"

#### Quick Links
- "Open Obesity Assessment Tool" button
- "Formulary" button
- "Sign In" button

### Behavior
- Clicking a visit card clears previous interview state, initializes new state in local storage, navigates to the corresponding interview page

---

## 4. Authentication

### 4.1 Auth Screen
- Tabs: Sign In / Sign Up
- Fields: Email, Password (min 6 chars for signup)
- On successful auth, redirect to `/formulary`
- On already logged in, redirect to `/formulary`
- Back to Home button

### 4.2 Role System
Database table: `user_roles` with columns: `id`, `user_id`, `role` (enum: `admin`, `clinician`, `user`), `created_at`

Role priority: admin > clinician > user. Default to `user` if no role found.

Computed properties:
- `isAdmin`: role === 'admin'
- `isClinician`: role === 'clinician' || role === 'admin'

---

## 5. Interview System

### 5.1 Interview State (persisted to local storage key: `weight-clinic-interview`)

```typescript
interface InterviewState {
  visitType: 'initial' | 'return' | null;
  currentQuestionIndex: number;
  responses: Array<{ questionId: number; answer: string | string[] | number }>;
  startTime: number | null;    // Date.now()
  elapsedTime: number;         // seconds
  isPaused: boolean;
  bmiData: {
    height: number | null;          // total inches
    weight: number | null;          // lbs
    heightInFeet: number | null;
    heightInInches: number | null;
    useFeetInches: boolean;         // default: true
  };
  importedData: string;            // raw pasted text
  isComplete: boolean;
}
```

### 5.2 Question Data Model

```typescript
interface Question {
  id: number;
  section: string;
  question: string;
  description?: string;
  type: 'text' | 'textarea' | 'number' | 'radio' | 'checkbox' | 'dropdown' | 'date';
  options?: string[];
}
```

### 5.3 Initial Visit Interview

**Phases:** `import` → `bmi` → `questions` → `summary`

#### Phase 1: Data Import (Optional)
- Large textarea for pasting unstructured patient intake data
- "Skip" and "Parse & Continue" buttons
- On parse: calls AI backend function `parse-patient-data` which extracts structured data:
  - Demographics (age, sex, ethnicity)
  - Measurements (height feet/inches, weight)
  - Symptoms (breathlessness, fatigue, chronic pain, urinary incontinence, reflux, sleep disorders, mental health)
  - Medical history (T2DM, PCOS, HTN, CVD, sleep apnea, NAFLD, osteoarthritis)
  - Functional limitations (mobility, bathing, dressing, toileting, continence, eating)
- Extracted data auto-fills BMI fields and interview responses

#### Phase 2: BMI Calculator
- Height input: toggle between "Feet & Inches" (two fields) and "Total inches" (one field)
- Weight input: lbs
- Real-time calculations:
  - **BMI** = (weight_lbs / height_inches²) × 703
  - **BMI Category**: Underweight (<18.5), Normal (18.5-24.9), Overweight (25-29.9), Obese I (30-34.9), Obese II (35-39.9), Obese III (≥40)
  - **Target weight for BMI 25** = (25 × height_inches²) / 703
  - **Weight to lose** = current weight − target weight
  - **Estimated weeks** = weight to lose / 1.5 lbs per week

#### Phase 3: Questions
One question displayed at a time with Back/Next navigation.

#### Clinical Data Header (shown during BMI and Questions phases)
Displays in a compact card:
- Age + Sex (e.g., "45yo F")
- Weight + BMI (e.g., "185 lbs (BMI 29.9)")
- Goal @BMI 25 (e.g., "155 lbs")
- **Protein intake** = round((weight_lbs / 2.205) × 1.2) → displayed as "Protein: Xg/day"
- Patient goal weight (from question id 6/52)
- Estimated weeks to goal

#### Progress Indicator
- Shows current question index / total
- Current section name

#### Encounter Timer
- Auto-starts on interview begin
- Pause/resume button
- Auto-resumes on Next if paused
- Reset button (confirms before clearing)

#### Initial Visit Questions (51 questions across 12 sections)

**Patient Demographics** (3 questions)
| ID | Question | Type | Options |
|----|----------|------|---------|
| 1 | Patient age (years)? | number | — |
| 2 | Patient sex? | radio | Male, Female |
| 53 | Patient ethnicity? | dropdown | Caucasian, African American, Hispanic/Latino, Asian, Other |

**Introduction & Verification** (2 questions)
| ID | Question | Type |
|----|----------|------|
| 3 | Primary goal for this visit? | textarea |
| 4 | Does the patient have a primary care provider? | radio (Yes/No) |

**Weight History** (2 questions)
| ID | Question | Type |
|----|----------|------|
| 5 | Tell me the story of your weight (age when began, triggers, highest/lowest weight, prior attempts) | textarea |
| 52 | What is your personal weight loss goal (lbs)? | number |

**Medications & Allergies** (3 questions)
| ID | Question | Type | Options |
|----|----------|------|---------|
| 11 | Current medications? | textarea | — |
| 12 | Allergies? | text | — |
| 13 | Any known weight-promoting medications? | radio | Yes, No, Unsure |

**Contraindication Screening** (7 questions)
| ID | Question | Type | Options |
|----|----------|------|---------|
| 14 | History of Medullary Thyroid Carcinoma (MTC)? | radio | Yes, No |
| 15 | History of MEN2? | radio | Yes, No |
| 16 | Family history of medullary thyroid cancer or MEN2? | radio | Yes, No |
| 17 | History of pancreatitis, gastroparesis, or gallbladder disease? | checkbox | Pancreatitis, Gastroparesis, Gallbladder disease, None |
| 18 | Any GI symptoms (reflux, nausea, etc.)? | text | — |
| 19 | Is the patient using contraception or planning pregnancy soon? | text | — |
| 20 | Does the patient have diabetes and use insulin? | radio | Yes, No |

**Medical History** (3 questions)
| ID | Question | Type |
|----|----------|------|
| 21 | Other medical conditions or surgeries? | textarea |
| 22 | Mental health concerns? | textarea |
| 23 | Family history (obesity, thyroid, metabolic issues)? | textarea |

**Functional Limitations** (1 question)
| ID | Question | Type | Options |
|----|----------|------|---------|
| 54 | ADL limitations? | checkbox | Mobility Limitations, Bathing Difficulty, Dressing Difficulty, Toileting Difficulty, Continence Issues, Eating Difficulty, None |

**Current Symptoms** (3 questions)
| ID | Question | Type | Options |
|----|----------|------|---------|
| 55 | Respiratory/exercise symptoms? | checkbox | Breathlessness/Dyspnea, Chronic Fatigue, None |
| 56 | Physical symptoms? | checkbox | Chronic Pain, Urinary Incontinence, GERD, None |
| 57 | Sleep/mental health concerns? | checkbox | Sleep Disorders, Mental Health Issues (Depression/Anxiety), None |

**Past Medical History** (3 questions)
| ID | Question | Type | Options |
|----|----------|------|---------|
| 58 | Metabolic/endocrine conditions? | checkbox | Type 2 Diabetes, PCOS, None |
| 59 | Cardiovascular conditions? | checkbox | Hypertension, Cardiovascular Disease, None |
| 60 | Other conditions? | checkbox | Sleep Apnea, NAFLD/NASH, Osteoarthritis, None |

**Lifestyle** (11 questions)
| ID | Question | Type | Options |
|----|----------|------|---------|
| 24 | Describe current diet briefly | textarea | — |
| 25 | Food sensitivities or eating patterns? | text | — |
| 26 | Typical daily meals? | textarea | — |
| 27 | Current activity level? | dropdown | Sedentary, Light, Moderate, Vigorous |
| 28 | Barriers to regular exercise? | text | — |
| 29 | Strength training per week? | number | — |
| 30 | Average sleep hours per night? | number | — |
| 31 | Sleep quality concerns? | text | — |
| 32 | Mood or stress issues? | text | — |
| 33 | Alcohol use? | text | — |
| 34 | Tobacco/vaping/substance use? | text | — |

**Medication Preferences** (4 questions)
| ID | Question | Type | Options |
|----|----------|------|---------|
| 35 | Previously used GLP-1 medications? | radio | Yes, No |
| 36 | Preferred medication? | dropdown | Semaglutide, Tirzepatide, Open to either |
| 37 | Additional medication preference details? | textarea | — |
| 38 | Concern about compounded options? | radio | Yes, No |

**Medication Education & Counseling** (4 questions)
| ID | Question | Type | Options |
|----|----------|------|---------|
| 39 | GLP-1 warnings discussed? | checkbox | Thyroid C-cell tumor risk (MTC/MEN2), Severe stomach problems, Kidney problems/dehydration, Gallbladder problems, Pancreatitis, Serious allergic reactions, Hypoglycemia risk, Vision changes, Tachycardia, Depression/suicidal thoughts, Birth control interaction |
| 40 | Common side effects reviewed? | radio | Yes, No |
| 41 | Patient questions about risks? | textarea | — |
| 42 | Patient verbalized understanding? | radio | Yes, No, Partial understanding - requires follow-up |

**Plan & Follow-Up** (9 questions)
| ID | Question | Type | Options |
|----|----------|------|---------|
| 43 | Selected medication and starting dose? | text | — |
| 44 | Labs ordered? | checkbox | A1C, Comprehensive metabolic panel, TSH, Lipid panel, Patient had done at PCP and will send to me |
| 45 | Additional lab details? | textarea | — |
| 46 | Body composition scan recommended? | radio | Yes, No |
| 47 | Sleep testing ordered? | radio | Yes, No, Suggest PCP order study, Not applicable |
| 48 | Dietitian referral needed? | radio | Yes, No, Already scheduled |
| 49 | Target weight loss goal? | text | — |
| 50 | Follow-up interval? | text | — |
| 51 | Additional notes? | textarea | — |

#### Phase 4: Interview Summary
- Header: Visit type, duration, response count
- Grouped by section: question → answer pairs
- Actions:
  - **Copy to Clipboard**: generates structured text summary
  - **Download as Text**: saves `.txt` file named `weight-clinic-{visitType}-visit-{date}.txt`
  - **Start New Interview**: resets and navigates home
  - **Proceed to Assessment**: maps interview data to assessment format, stores in localStorage, navigates to `/assessment`

**Data mapping from interview to assessment:**
- BMI data → `anthropometrics.height`, `anthropometrics.weight`
- Question 1 (age) → `anthropometrics.age`
- Question 2 (sex) → `anthropometrics.sex`
- Question 53 (ethnicity) → `anthropometrics.ethnicity`
- Body fat % calculated via **Deurenberg formula**: `BF% = (1.20 × BMI) + (0.23 × age) − (10.8 × sex_mult) − 5.4` where sex_mult = 1 for male, 0 for female
- Question 54 (ADL) → functional data fields
- Questions 55-60 (symptoms/history) → clinical data fields

### 5.4 Return Visit Interview

**Phases:** `questions` → `summary` (no import or BMI phase)

**30 questions across 7 sections:**

**Visit Information** (2 questions)
| ID | Question | Type |
|----|----------|------|
| 1 | Visit Date | date |
| 2 | Current Weight (lbs) | number |

**Weight History & Progress** (1 question)
| ID | Question | Type |
|----|----------|------|
| 3 | Previous weights and dates (MM/DD/YYYY - weight) | textarea |

**Current Medication** (3 questions)
| ID | Question | Type |
|----|----------|------|
| 4 | Current Weight Loss Medication | text |
| 5 | Current Dose | text |
| 6 | How long at this dose? | text |

**Side Effects & Tolerance** (3 questions)
| ID | Question | Type | Options |
|----|----------|------|---------|
| 7 | Side effects experienced? | checkbox | Nausea, Vomiting, Diarrhea, Constipation, Headache, Fatigue, Dizziness, None |
| 8 | Side effects details | textarea | — |
| 9 | Appetite control (1-10, 10=excellent) | number | — |

**Diet & Nutrition** (6 questions)
| ID | Question | Type | Options |
|----|----------|------|---------|
| 10 | Daily calorie intake (avg) | number | — |
| 11 | Protein (grams/day) | number | — |
| 12 | Carbs (grams/day) | number | — |
| 13 | Fats (grams/day) | number | — |
| 14 | Met with dietitian? | radio | Yes, No, Scheduled |
| 15 | Dietitian consultation notes | textarea | — |

**Exercise & Activity** (2 questions)
| ID | Question | Type |
|----|----------|------|
| 16 | Current exercise routine | textarea |
| 17 | Minutes of exercise per week | number |

**Labs & Measurements** (4 questions)
| ID | Question | Type | Options |
|----|----------|------|---------|
| 18 | Recent labs ordered/reviewed? | radio | Yes, No, Pending |
| 19 | Lab results and notes | textarea | — |
| 20 | Body Fat % | number | — |
| 21 | Muscle Mass (lbs or %) | text | — |

**Clinical Assessment** (3 questions)
| ID | Question | Type |
|----|----------|------|
| 22 | Blood pressure | text |
| 23 | Heart rate | number |
| 24 | Any new medical concerns? | textarea |

**Plan & Recommendations** (6 questions)
| ID | Question | Type | Options |
|----|----------|------|---------|
| 25 | Medication plan | radio | Continue current dose, Increase dose, Decrease dose, Change medication, Discontinue |
| 26 | New medication/dose if changing | text | — |
| 27 | Provider notes and recommendations | textarea | — |
| 28 | Patient questions and concerns | textarea | — |
| 29 | Follow-up plan | text | — |
| 30 | Additional notes | textarea | — |

---

## 6. Clinical Obesity Diagnostic Assessment

### 6.1 Assessment Screen Layout
- **Left panel (2/3 width):** 4-tab patient data entry (Anthropometric, Clinical, Laboratory, Functional)
- **Right panel (1/3 width):** Real-time diagnostic results

### 6.2 Data Models

#### AnthropometricData
```typescript
{
  height?: number;             // inches
  weight?: number;             // pounds
  bmi?: number;
  waistCircumference?: number; // inches
  hipCircumference?: number;   // inches
  waistHipRatio?: number;
  waistHeightRatio?: number;
  bodyFatPercentage?: number;
  age?: number;
  sex?: 'male' | 'female';
  ethnicity?: string;
}
```

#### ClinicalData
```typescript
{
  breathlessness?: boolean;
  fatigue?: boolean;
  chronicPain?: boolean;
  urinaryIncontinence?: boolean;
  sleepDisorders?: boolean;
  reflux?: boolean;
  osteoarthritis?: boolean;
  type2Diabetes?: boolean;
  hypertension?: boolean;
  pcos?: boolean;
  sleepApnea?: boolean;
  nafld?: boolean;
  cardiovascularDisease?: boolean;
  mentalHealth?: boolean;
}
```

#### LaboratoryData
```typescript
{
  fastingGlucose?: number;
  hba1c?: number;
  totalCholesterol?: number;
  ldl?: number;
  hdl?: number;
  triglycerides?: number;
  alt?: number;
  ast?: number;
  fibrosis?: boolean;
  egfr?: number;
  microalbuminuria?: boolean;
  crp?: number;
}
```

#### FunctionalData
```typescript
{
  mobilityLimitations?: boolean;
  bathingDifficulty?: boolean;
  dressingDifficulty?: boolean;
  toiletingDifficulty?: boolean;
  continenceDifficulty?: boolean;
  eatingDifficulty?: boolean;
  qualityOfLifeScore?: number;
  physicalLimitations?: boolean;
  psychosocialImpact?: boolean;
}
```

### 6.3 Diagnostic Engine (Core Algorithm)

#### Step 1: Confirm Excess Adiposity

**Minimum data required:** height + weight (or direct BMI)

**BMI Calculation:** `BMI = (weight_lbs / height_inches²) × 703`

**Ethnicity-specific thresholds:**
- Asian: Pre-obesity ≥23, Obesity ≥27, Normal <22.9
- All others: Pre-obesity ≥25, Obesity ≥30, Normal <25

**Excess adiposity confirmed if ANY:**
1. BMI > 40 (any ethnicity)
2. BMI ≥ ethnicity-specific obesity threshold
3. BMI ≥ ethnicity-specific pre-obesity threshold
4. Body fat % > 45%
5. For normal BMI (< threshold): requires ≥2 of these additional risk factors:
   - Elevated waist circumference (Asian: M≥35.4", F≥31.5"; Standard: M≥40", F≥35")
   - Waist-to-height ratio ≥ 0.5
   - Elevated waist-to-hip ratio (M≥0.9, F≥0.85)
   - Body fat % above age/sex-specific upper normal range

**Body fat normal ranges by age and sex:**

| Age Range | Male (lower-upper) | Female (lower-upper) |
|-----------|--------------------|-----------------------|
| 18-29 | 12-19% | 24-32% |
| 30-39 | 14-22% | 25-34% |
| 40-49 | 16-24% | 27-36% |
| 50-59 | 18-26% | 29-38% |
| 60+ | 20-28% | 30-40% |

#### Step 2: Assess Organ Dysfunction

Each maps to an organ system string:

| Condition | System Label |
|-----------|-------------|
| T2DM OR HbA1c ≥6.5 OR fasting glucose ≥126 | "Metabolic: Type 2 diabetes" |
| Hypertension OR CVD | "Cardiovascular: Hypertension/CVD" |
| NAFLD OR fibrosis OR ALT>40 OR AST>40 | "Hepatic: NAFLD/elevated enzymes" |
| eGFR <60 OR microalbuminuria | "Renal: Decreased eGFR/albuminuria" |
| Sleep apnea OR breathlessness | "Respiratory: Sleep apnea/dyspnea" |
| PCOS | "Reproductive: PCOS" |
| Osteoarthritis | "Musculoskeletal: Osteoarthritis" |

#### Step 3: Assess Functional Limitations

Direct mapping of boolean flags: mobility, bathing, dressing, toileting, continence, eating.

#### Step 4: Identify Risk Factors

| Condition | Risk Factor Label |
|-----------|-------------------|
| fatigue | "Chronic fatigue" |
| chronicPain | "Chronic pain" |
| urinaryIncontinence | "Urinary incontinence" |
| sleepDisorders | "Sleep disorders" |
| reflux | "GERD" |
| mentalHealth | "Mental health concerns" |
| triglycerides ≥150 | "Elevated triglycerides" |
| HDL <40 | "Low HDL cholesterol" |
| CRP >3 | "Elevated CRP (inflammation)" |

#### Step 5: Classify

| Condition | Classification |
|-----------|---------------|
| Excess adiposity NOT confirmed | `no-obesity` |
| Excess adiposity + organ dysfunction or functional limitations | `clinical-obesity` |
| Excess adiposity without organ dysfunction | `preclinical-obesity` |

#### Step 6: Assess Confidence

Score (0-6):
- +1 if height + weight present
- +1 if waist circumference present
- +1 if body fat % present
- +1 if ≥3 clinical fields filled
- +1 if ≥3 lab fields filled
- +1 if ≥2 functional fields filled

Score ≥5 → high, ≥3 → medium, <3 → low

#### Step 7: Generate Recommendations

| Classification | Recommendations |
|----------------|----------------|
| clinical-obesity | Comprehensive management plan; Consider pharmacotherapy/surgery; Address organ dysfunction; Monitor for complications |
| preclinical-obesity | Lifestyle intervention; Regular monitoring; Preventive counseling; Weight management referral |
| no-obesity | Continue healthy lifestyle; Routine maintenance; Address risk factors (if any) |

### 6.4 Diagnostic Results Display

- **Classification card** with color-coded badge (destructive/warning/success)
- **Chart Summary** — monospace text block ready for EHR copy (includes date, classification, key metrics, findings, plan, confidence, reference)
- **Copy Chart Summary** button
- **Clinical Reasoning** section (generated text explaining the classification)
- **Organ Dysfunction** list (if any)
- **Functional Limitations** list (if any)
- **Affected Systems** badges
- **Recommendations** list
- **Risk Factors** list
- **Export Report** button → downloads HTML file with full report, print-ready

---

## 7. Medication Formulary

### 7.1 Data Model

```typescript
type MedicationRoute = 'oral' | 'weekly_injection' | 'daily_injection' | 'other';

interface Medication {
  id: string;                    // UUID
  generic_name: string;
  brand_names: string[];
  drug_class: string;
  moa_short?: string;
  moa_long?: string;
  route: MedicationRoute;
  dosing_summary?: string;
  titration_schedule?: Array<{ week: number; dose: string; notes?: string }>;
  missed_dose_rules?: string;
  contraindications: string[];
  boxed_warning?: string;
  serious_warnings: string[];
  common_adverse_effects: string[];
  serious_adverse_effects: string[];
  interactions: string[];
  pregnancy_lactation?: {
    pregnancy_category?: string;
    pregnancy_notes?: string;
    lactation_notes?: string;
    contraindicated?: boolean;
  };
  renal_adjustment?: string;
  hepatic_adjustment?: string;
  monitoring?: {
    frequency?: string;
    parameters?: string[];
    notes?: string;
  };
  efficacy?: {
    timepoint_months?: number;
    mean_tbwl_percent?: number;
    range_tbwl_percent?: string;
    key_trial_name?: string;
  };
  comorbidity_fit_tags: string[];
  patient_counseling?: string;
  pa_template?: string;
  icd10_suggestions: string[];
  med_references?: Array<{
    title: string;
    source_name: string;
    url?: string;
    accessed_date?: string;
  }>;
  last_reviewed_at?: string;
  version: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}
```

### 7.2 Database Tables

**`medications`** — stores all medication monographs. Soft-delete via `is_active` boolean.

**`medication_change_log`** — audit trail:
- `medication_id` (FK → medications)
- `changed_by` (user UUID)
- `changed_at` (timestamp)
- `change_summary` (text)
- `before_snapshot` (JSON)
- `after_snapshot` (JSON)

**`formulary_rules`** — payer-specific formulary rules:
- `payer_name`, `rule_set` (JSON), `last_verified_at`

**`user_roles`** — role-based access:
- `user_id`, `role` (admin | clinician | user)

### 7.3 Formulary Browse Screen

- Header: "Browse Medications" + medication count
- Admin-only buttons: "AI Import", "Import from FDA"
- **Filters:**
  - Search (by generic name or brand name, client-side)
  - Drug class (multi-select)
  - Route (multi-select)
  - Pregnancy contraindicated (boolean toggle)
  - Comorbidity tags (multi-select)
- **Table columns:** Generic Name, Brand Names, Drug Class, Route, Efficacy (TBWL%), Comorbidity Tags
- Click row → navigate to detail page

### 7.4 Medication Detail Screen

Accordion sections (all expandable):
1. **Indication & Eligibility** — MOA short + long
2. **Dosing & Titration** — Summary, step-by-step titration table, missed dose rules
3. **Efficacy** — Mean TBWL%, range, timepoint, trial name
4. **Contraindications & Warnings** — Lists
5. **Adverse Effects** — Common (badges) + Serious (destructive badges)
6. **Interactions** — List
7. **Pregnancy & Lactation** — Category, notes, contraindicated badge
8. **Renal & Hepatic Adjustment** — Text
9. **Monitoring** — Frequency, parameters (badges), notes
10. **Patient Counseling** — Text with copy button
11. **Prior Authorization Template** — Monospace text with copy button
12. **ICD-10 Suggestions** — Clickable badges that copy code
13. **References** — Links with access dates

Admin: "Edit" button opens edit dialog.

### 7.5 Medication Compare Screen

- Select up to 4 medications via searchable popover
- Side-by-side comparison grid:
  - Route/Frequency
  - Mean TBWL%
  - Common AEs (first 5 + overflow count)
  - Serious Warnings (first 3)
  - Contraindications (first 4)
  - Pregnancy status
  - Monitoring (frequency + parameters)
  - Counseling summary (truncated)
- "Copy Comparison" button generates text comparison

### 7.6 Medication Edit (Admin only)

Dialog with fields for all editable medication properties. On save:
1. Increment version
2. Save before/after snapshots to change log
3. Record change summary

### 7.7 Import Methods

#### FDA Label Import (Admin only)
- Search by drug name → calls openFDA Drug Labeling API
- Parses: generic name, brand names, route, dosing, contraindications, warnings, adverse effects, interactions, pregnancy/lactation info
- URL: `https://api.fda.gov/drug/label.json`
- Auto-generates DailyMed reference link

#### AI Import (Admin only)
- Paste raw drug label text (up to 50,000 chars)
- AI extracts all structured fields including titration schedule, efficacy data, comorbidity tags
- Preview extracted data → import to database

---

## 8. AI-Powered Features

### 8.1 Patient Data Extraction
- **Input:** Unstructured patient intake text
- **Output:** Structured demographics, measurements, symptoms, medical history, functional limitations
- **Model:** Gemini 2.5 Flash (via Lovable AI Gateway)
- **For macOS:** Use local LLM (e.g., llama.cpp) or OpenAI API with user-provided key

### 8.2 Drug Label Parsing
- **Input:** Raw drug label / prescribing information text (up to 50K chars)
- **Output:** Full structured medication object
- **Model:** Gemini 2.5 Flash
- **For macOS:** Same as above

---

## 9. Local Database Schema (SQLite for macOS)

Replace the cloud Supabase database with local SQLite. Schema:

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE user_roles (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  user_id TEXT NOT NULL REFERENCES users(id),
  role TEXT NOT NULL CHECK(role IN ('admin', 'clinician', 'user')),
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE medications (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  generic_name TEXT NOT NULL,
  brand_names TEXT, -- JSON array
  drug_class TEXT NOT NULL,
  moa_short TEXT,
  moa_long TEXT,
  route TEXT NOT NULL CHECK(route IN ('oral','weekly_injection','daily_injection','other')),
  dosing_summary TEXT,
  titration_schedule TEXT, -- JSON array
  missed_dose_rules TEXT,
  contraindications TEXT, -- JSON array
  boxed_warning TEXT,
  serious_warnings TEXT, -- JSON array
  common_adverse_effects TEXT, -- JSON array
  serious_adverse_effects TEXT, -- JSON array
  interactions TEXT, -- JSON array
  pregnancy_lactation TEXT, -- JSON object
  renal_adjustment TEXT,
  hepatic_adjustment TEXT,
  monitoring TEXT, -- JSON object
  efficacy TEXT, -- JSON object
  comorbidity_fit_tags TEXT, -- JSON array
  patient_counseling TEXT,
  pa_template TEXT,
  icd10_suggestions TEXT, -- JSON array
  med_references TEXT, -- JSON array
  label_set_id TEXT,
  raw_label_data TEXT, -- JSON
  last_reviewed_at TEXT,
  version INTEGER DEFAULT 1,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE medication_change_log (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  medication_id TEXT NOT NULL REFERENCES medications(id),
  changed_by TEXT,
  changed_at TEXT DEFAULT (datetime('now')),
  change_summary TEXT NOT NULL,
  before_snapshot TEXT, -- JSON
  after_snapshot TEXT -- JSON
);

CREATE TABLE formulary_rules (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  payer_name TEXT NOT NULL,
  rule_set TEXT, -- JSON
  last_verified_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

---

## 10. Key Formulas Reference

| Formula | Expression |
|---------|-----------|
| BMI (imperial) | `(weight_lbs / height_inches²) × 703` |
| Target weight for BMI 25 | `(25 × height_inches²) / 703` |
| Weight to lose | `current_weight − target_weight` |
| Weeks to goal | `weight_to_lose / 1.5` |
| Protein intake (g/day) | `round((weight_lbs / 2.205) × 1.2)` |
| Body fat % (Deurenberg) | `(1.20 × BMI) + (0.23 × age) − (10.8 × sex_mult) − 5.4` |
| Imperial height → metric | `inches × 0.0254 = meters` |
| Imperial weight → metric | `lbs × 0.453592 = kg` |

---

## 11. Export/Output Features

1. **Interview Summary** — Copy to clipboard or download as `.txt`
2. **Chart Summary** — Concise obesity assessment text for EHR
3. **Diagnostic Report** — Downloadable HTML report with print CSS
4. **Medication Comparison** — Copy comparison text
5. **ICD-10 Codes** — Click-to-copy
6. **Patient Counseling** — Click-to-copy
7. **PA Template** — Click-to-copy

---

## 12. macOS-Specific Considerations

1. **Local Storage:** Replace localStorage with SQLite or UserDefaults for interview state persistence
2. **AI Integration:** Use OpenAI API directly (user provides API key in Settings) or integrate a local LLM
3. **FDA API:** Call `https://api.fda.gov/drug/label.json` directly from the app (no proxy needed for macOS)
4. **Auth:** Local SQLite auth or simplify to single-user mode with optional password protection
5. **Clipboard:** Use `NSPasteboard` for copy operations
6. **File Export:** Use `NSSavePanel` for file downloads
7. **Dark Mode:** Follow system appearance via `@Environment(\.colorScheme)`
8. **Navigation:** Use `NavigationSplitView` or `NavigationStack` to mirror the web routing
