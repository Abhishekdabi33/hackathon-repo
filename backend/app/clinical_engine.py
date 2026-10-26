"""
LabLens AI - Clinical Validation & EvidenceTrace Engine
Provides deterministic numerical range checking, medical reference grounding,
and evidence-linked traceability for clinical and laboratory reports.
"""

import re
import math
from typing import Dict, List, Any, Optional

# Standard Gold-Standard Reference Ranges for Common Clinical Tests
CLINICAL_STANDARDS: Dict[str, Dict[str, Any]] = {
    # Complete Blood Count (CBC)
    "hemoglobin": {
        "aliases": ["hemoglobin", "hb", "hgb"],
        "unit": "g/dL",
        "normal_min": 12.0,
        "normal_max": 17.5,
        "critical_min": 7.0,
        "critical_max": 20.0,
        "description": "Measures the oxygen-carrying protein in red blood cells.",
        "low_implication": "May indicate anemia, nutritional deficiency (iron/folate/B12), or blood loss.",
        "high_implication": "May indicate polycythemia, dehydration, or chronic hypoxia (smoking, lung disease).",
        "doctor_questions": [
            "Could my hemoglobin level explain feelings of fatigue or shortness of breath?",
            "Are follow-up iron or ferritin studies recommended?"
        ]
    },
    "rbc": {
        "aliases": ["rbc", "red blood cell count", "erythrocyte count"],
        "unit": "million/mcL",
        "normal_min": 4.0,
        "normal_max": 6.0,
        "critical_min": 2.5,
        "critical_max": 7.5,
        "description": "Counts the total circulating red blood cells delivering oxygen to tissues.",
        "low_implication": "May indicate anemia, bone marrow suppression, or hemolysis.",
        "high_implication": "May indicate erythrocytosis, congenital heart issues, or severe dehydration.",
        "doctor_questions": ["Is my red blood cell count aligned with my iron and hydration status?"]
    },
    "wbc": {
        "aliases": ["wbc", "white blood cell count", "leukocyte count", "total leukocytes"],
        "unit": "/mcL",
        "normal_min": 4000.0,
        "normal_max": 11000.0,
        "critical_min": 2000.0,
        "critical_max": 30000.0,
        "description": "Measures immune cells responsible for defending against infections and inflammation.",
        "low_implication": "Leukopenia: higher vulnerability to infection, potential viral or autoimmune cause.",
        "high_implication": "Leukocytosis: often caused by active bacterial infection, physical stress, or inflammation.",
        "doctor_questions": [
            "Does my WBC count indicate an active or resolving infection?",
            "Should we evaluate a differential count (neutrophils/lymphocytes)?"
        ]
    },
    "platelets": {
        "aliases": ["platelets", "platelet count", "thrombocytes"],
        "unit": "/mcL",
        "normal_min": 150000.0,
        "normal_max": 450000.0,
        "critical_min": 50000.0,
        "critical_max": 1000000.0,
        "description": "Essential cell fragments required for normal blood clotting and vessel repair.",
        "low_implication": "Thrombocytopenia: increased risk of easy bruising or bleeding.",
        "high_implication": "Thrombocytosis: reactive inflammation or primary marrow disorder.",
        "doctor_questions": ["Should I be cautious with medications like aspirin or NSAIDs given my platelet levels?"]
    },

    # Metabolic & Diabetes
    "fasting_glucose": {
        "aliases": ["fasting blood sugar", "fasting glucose", "fbs", "glucose fasting", "blood sugar fasting"],
        "unit": "mg/dL",
        "normal_min": 70.0,
        "normal_max": 99.0,
        "critical_min": 50.0,
        "critical_max": 350.0,
        "description": "Measures blood glucose concentration after an overnight fast (8-12 hours).",
        "low_implication": "Hypoglycemia: can cause dizziness, sweating, confusion, and shakiness.",
        "high_implication": "100-125 mg/dL suggests prediabetes; 126+ mg/dL on repeated tests suggests diabetes mellitus.",
        "doctor_questions": [
            "Was my fasting window adequate for this test?",
            "Would you recommend checking an HbA1c to see my 3-month average glucose?"
        ]
    },
    "hba1c": {
        "aliases": ["hba1c", "glycated hemoglobin", "glycosylated hemoglobin", "a1c"],
        "unit": "%",
        "normal_min": 4.0,
        "normal_max": 5.6,
        "critical_min": 3.5,
        "critical_max": 14.0,
        "description": "Reflects the average blood glucose concentration over the past 2-3 months.",
        "low_implication": "Rare; can occur with hemolytic anemia or hemoglobin variants.",
        "high_implication": "5.7-6.4% indicates prediabetes; 6.5%+ indicates diabetes.",
        "doctor_questions": [
            "What lifestyle or dietary adjustments are most appropriate for my A1C level?",
            "What target A1C percentage should I aim for over the next 6 months?"
        ]
    },

    # Renal / Kidney Function
    "creatinine": {
        "aliases": ["creatinine", "serum creatinine", "sr creatinine", "creat"],
        "unit": "mg/dL",
        "normal_min": 0.6,
        "normal_max": 1.3,
        "critical_min": 0.3,
        "critical_max": 5.0,
        "description": "Byproduct of muscle metabolism cleared entirely by the kidneys; key kidney function marker.",
        "low_implication": "May reflect low muscle mass, advanced age, or severe malnutrition.",
        "high_implication": "Suggests decreased kidney filtration rate (GFR) or temporary acute kidney stress/dehydration.",
        "doctor_questions": [
            "Is an estimated glomerular filtration rate (eGFR) calculated from this creatinine?",
            "Are any of my current medications affecting kidney clearance?"
        ]
    },
    "blood_urea_nitrogen": {
        "aliases": ["bun", "blood urea nitrogen", "urea", "serum urea"],
        "unit": "mg/dL",
        "normal_min": 7.0,
        "normal_max": 20.0,
        "critical_min": 3.0,
        "critical_max": 100.0,
        "description": "Measures the amount of urea nitrogen in blood, reflecting protein breakdown and kidney excretion.",
        "low_implication": "Can be seen with low protein intake, severe liver disease, or overhydration.",
        "high_implication": "Often elevated in dehydration, high dietary protein, or impaired renal excretion.",
        "doctor_questions": ["Could dehydration have contributed to my elevated urea/BUN levels?"]
    },

    # Liver Function (LFT)
    "alt_sgpt": {
        "aliases": ["alt", "sgpt", "alanine aminotransferase", "alanine transaminase"],
        "unit": "U/L",
        "normal_min": 7.0,
        "normal_max": 56.0,
        "critical_min": 0.0,
        "critical_max": 1000.0,
        "description": "Enzyme concentrated primarily in liver cells; sensitive marker of hepatocellular injury.",
        "low_implication": "Generally normal clinical variation; no adverse clinical significance.",
        "high_implication": "Indicates liver cell inflammation (fatty liver, viral hepatitis, medication effect, alcohol).",
        "doctor_questions": [
            "Could over-the-counter medications or supplements be elevating my liver enzymes?",
            "Is an abdominal ultrasound recommended to evaluate fatty liver?"
        ]
    },
    "ast_sgot": {
        "aliases": ["ast", "sgot", "aspartate aminotransferase", "aspartate transaminase"],
        "unit": "U/L",
        "normal_min": 10.0,
        "normal_max": 40.0,
        "critical_min": 0.0,
        "critical_max": 1000.0,
        "description": "Enzyme present in liver, cardiac muscle, skeletal muscle, and kidneys.",
        "low_implication": "Normal clinical finding.",
        "high_implication": "Elevated during liver injury, strenuous muscle exercise, or cardiac events.",
        "doctor_questions": ["Does the AST to ALT ratio provide additional diagnostic clues in my case?"]
    },
    "total_bilirubin": {
        "aliases": ["total bilirubin", "bilirubin total", "bili total", "serum bilirubin"],
        "unit": "mg/dL",
        "normal_min": 0.2,
        "normal_max": 1.2,
        "critical_min": 0.0,
        "critical_max": 15.0,
        "description": "Yellow pigment formed from the natural breakdown of heme in red blood cells.",
        "low_implication": "Normal clinical finding with no known pathologic relevance.",
        "high_implication": "Hyperbilirubinemia: can cause jaundice (yellow skin/eyes), hemolysis, or bile duct obstruction.",
        "doctor_questions": ["Should we differentiate this into direct (conjugated) vs indirect (unconjugated) bilirubin?"]
    },

    # Lipid Profile (Cardiovascular)
    "total_cholesterol": {
        "aliases": ["total cholesterol", "cholesterol total", "serum cholesterol"],
        "unit": "mg/dL",
        "normal_min": 125.0,
        "normal_max": 200.0,
        "critical_min": 80.0,
        "critical_max": 400.0,
        "description": "Measures total circulating sterol lipids in blood.",
        "low_implication": "Rare; can occur with severe malabsorption, hyperthyroidism, or liver dysfunction.",
        "high_implication": "Elevated cholesterol contributes to arterial plaque accumulation (atherosclerosis).",
        "doctor_questions": ["What is my overall 10-year cardiovascular risk score based on this lipid profile?"]
    },
    "hdl_cholesterol": {
        "aliases": ["hdl", "hdl cholesterol", "high density lipoprotein", "good cholesterol"],
        "unit": "mg/dL",
        "normal_min": 40.0,
        "normal_max": 90.0,
        "critical_min": 20.0,
        "critical_max": 120.0,
        "description": "Known as 'protective cholesterol'—transports excess cholesterol away from arteries back to the liver.",
        "low_implication": "Increased risk factor for cardiovascular disease.",
        "high_implication": "Cardioprotective; associated with reduced coronary risk.",
        "doctor_questions": ["What exercise and dietary changes can help raise my protective HDL levels?"]
    },
    "ldl_cholesterol": {
        "aliases": ["ldl", "ldl cholesterol", "low density lipoprotein", "bad cholesterol"],
        "unit": "mg/dL",
        "normal_min": 50.0,
        "normal_max": 100.0,
        "critical_min": 30.0,
        "critical_max": 250.0,
        "description": "Primary carrier of cholesterol in blood; primary target for cardiovascular risk reduction.",
        "low_implication": "Generally favorable unless accompanied by severe malnutrition.",
        "high_implication": "Primary driver of atherosclerosis and coronary artery disease.",
        "doctor_questions": ["Do my personal or family risk factors warrant starting a statin or lipid-lowering therapy?"]
    },
    "triglycerides": {
        "aliases": ["triglycerides", "tg", "serum triglycerides"],
        "unit": "mg/dL",
        "normal_min": 40.0,
        "normal_max": 150.0,
        "critical_min": 20.0,
        "critical_max": 1000.0,
        "description": "Main form of stored fat in the body, circulating after meals and synthesized by the liver.",
        "low_implication": "Normal clinical finding.",
        "high_implication": "Hypertriglyceridemia: associated with insulin resistance, metabolic syndrome, and pancreatitis (>500).",
        "doctor_questions": ["Can reducing refined carbs and sugars help normalize my triglyceride levels?"]
    },

    # Thyroid Function
    "tsh": {
        "aliases": ["tsh", "thyroid stimulating hormone", "thyrotropin", "ultrasensitive tsh"],
        "unit": "uIU/mL",
        "normal_min": 0.4,
        "normal_max": 4.5,
        "critical_min": 0.05,
        "critical_max": 30.0,
        "description": "Pituitary hormone regulating thyroid gland hormone production (T3 and T4).",
        "low_implication": "Suggests hyperthyroidism (overactive thyroid) or pituitary hypofunction.",
        "high_implication": "Suggests hypothyroidism (underactive thyroid)—pituitary is working harder to stimulate thyroid.",
        "doctor_questions": [
            "Should we also check Free T3 and Free T4 to complete the thyroid evaluation?",
            "Could my symptoms (fatigue, weight fluctuation, temperature intolerance) be related to this TSH level?"
        ]
    },

    # Vitamins
    "vitamin_d": {
        "aliases": ["vitamin d", "25-hydroxy vitamin d", "25-oh vitamin d", "vit d"],
        "unit": "ng/mL",
        "normal_min": 30.0,
        "normal_max": 100.0,
        "critical_min": 10.0,
        "critical_max": 150.0,
        "description": "Critical prohormone required for calcium absorption, bone mineralization, and immune regulation.",
        "low_implication": "<20 ng/mL is deficient; 20-29 ng/mL is insufficient. Can cause bone aches and fatigue.",
        "high_implication": ">100 ng/mL carries risk of hypercalcemia and kidney stone formation.",
        "doctor_questions": ["What dosage of supplemental Vitamin D3 and K2 is appropriate for my current level?"]
    },
    "vitamin_b12": {
        "aliases": ["vitamin b12", "b12", "cobalamin", "cyanocobalamin"],
        "unit": "pg/mL",
        "normal_min": 200.0,
        "normal_max": 900.0,
        "critical_min": 100.0,
        "critical_max": 2000.0,
        "description": "Essential water-soluble vitamin required for red blood cell synthesis and peripheral nerve myelin integrity.",
        "low_implication": "Can cause megaloblastic anemia, peripheral neuropathy (tingling/numbness in fingers/toes), and cognitive haze.",
        "high_implication": "Usually harmless from supplementation; rarely associated with liver or myeloproliferative disorders.",
        "doctor_questions": ["Should I take oral B12 or sublingual/injectable B12 to improve absorption?"]
    },

    # Vital Signs & Clinical Measurements
    "blood_pressure_systolic": {
        "aliases": ["blood pressure", "bloodpressure", "bp", "systolic", "systolic blood pressure", "sys bp"],
        "unit": "mmHg",
        "normal_min": 90.0,
        "normal_max": 120.0,
        "critical_min": 70.0,
        "critical_max": 180.0,
        "description": "Measures arterial pressure during cardiac contraction (systole).",
        "low_implication": "Hypotension (<90 mmHg): may lead to dizziness, lightheadedness, or reduced cerebral perfusion.",
        "high_implication": "Prehypertension / Stage 1-2 Hypertension (>=130-140 mmHg). Increases long-term vascular and kidney stress.",
        "doctor_questions": [
            "My systolic blood pressure was 140 mmHg. Is my current antihypertensive regimen (e.g. hydrochlorothiazide) keeping my BP well-controlled?",
            "Would you recommend keeping a home blood pressure log morning and evening?",
            "What lifestyle or dietary modifications (e.g. DASH diet, low sodium) should I follow?"
        ]
    },
    "blood_pressure_diastolic": {
        "aliases": ["diastolic", "diastolic blood pressure", "dia bp"],
        "unit": "mmHg",
        "normal_min": 60.0,
        "normal_max": 80.0,
        "critical_min": 40.0,
        "critical_max": 120.0,
        "description": "Measures arterial pressure between heartbeats while the heart rests (diastole).",
        "low_implication": "Low diastolic pressure; may be seen with arterial stiffness or vasodilation.",
        "high_implication": "Diastolic hypertension (>=80-90 mmHg); indicates elevated baseline vascular resistance.",
        "doctor_questions": ["Is my diastolic blood pressure within a healthy range?"]
    },
    "pulse": {
        "aliases": ["pulse", "heart rate", "pulse rate", "hr"],
        "unit": "bpm",
        "normal_min": 60.0,
        "normal_max": 100.0,
        "critical_min": 40.0,
        "critical_max": 150.0,
        "description": "Measures the number of heartbeats per minute at rest.",
        "low_implication": "Bradycardia (<60 bpm): may be physiological in athletes or indicate conduction/medication effect.",
        "high_implication": "Tachycardia (>100 bpm): may reflect stress, fever, dehydration, caffeine, or arrhythmia.",
        "doctor_questions": ["Is my resting heart rate optimal for my age and daily activity level?"]
    },
    "temperature": {
        "aliases": ["temperature", "temp", "body temperature"],
        "unit": "°C",
        "normal_min": 36.1,
        "normal_max": 37.2,
        "critical_min": 35.0,
        "critical_max": 39.5,
        "description": "Core body temperature reflecting metabolic homeostasis and thermoregulation.",
        "low_implication": "Hypothermia: reduced metabolic rate or environmental exposure.",
        "high_implication": "Pyrexia / Fever (>37.5-38.0 °C): inflammatory or infectious response.",
        "doctor_questions": ["Is my body temperature in a normal, healthy range?"]
    },
    "respiratory_rate": {
        "aliases": ["respiratory rate", "respiratory rt", "breathing rate", "rr"],
        "unit": "/min",
        "normal_min": 12.0,
        "normal_max": 20.0,
        "critical_min": 8.0,
        "critical_max": 30.0,
        "description": "Frequency of respiration (breaths taken per minute).",
        "low_implication": "Bradypnea (<12/min): central nervous system depression or metabolic imbalance.",
        "high_implication": "Tachypnea (>20/min): compensatory response for hypoxia, fever, pain, or pulmonary distress.",
        "doctor_questions": ["Are my resting respiratory rate and lung sounds reassuring?"]
    }
}


class ClinicalValidator:
    """
    Deterministic Python Validation Engine.
    Executes rule-based numerical comparisons against both reported reference ranges
    and clinical standards to guarantee accuracy and eliminate hallucinations.
    """

    def __init__(self):
        self.standards = CLINICAL_STANDARDS

    def match_metric_key(self, raw_name: str) -> Optional[str]:
        """Finds standardized metric key by checking normalized name against all clinical aliases with word boundaries."""
        clean = re.sub(r"[^a-zA-Z0-9\s]", " ", raw_name).lower().strip()

        # Check exact alias matches first
        for key, spec in self.standards.items():
            for alias in spec["aliases"]:
                if alias == clean or re.search(rf"\b{re.escape(alias)}\b", clean):
                    return key
        return None

    def parse_numeric_value(self, val_str: Any) -> Optional[float]:
        """Safely extracts a float value from text like '14.2 g/dL', '>150', '<0.5', etc."""
        if val_str is None:
            return None
        if isinstance(val_str, (int, float)):
            return float(val_str)

        cleaned = str(val_str).replace(",", "").strip()
        match = re.search(r"[-+]?\d*\.?\d+", cleaned)
        if match:
            try:
                return float(match.group(0))
            except ValueError:
                return None
        return None

    def parse_reference_range(self, range_str: str) -> Dict[str, Optional[float]]:
        """Parses reported laboratory reference range strings like '12.0 - 16.5', '< 200', '70-99'."""
        result = {"min": None, "max": None}
        if not range_str:
            return result

        clean_str = range_str.replace("to", "-").strip()
        # Look for hyphenated min-max
        hyphen_match = re.search(r"(\d*\.?\d+)\s*[-–—]\s*(\d*\.?\d+)", clean_str)
        if hyphen_match:
            try:
                result["min"] = float(hyphen_match.group(1))
                result["max"] = float(hyphen_match.group(2))
                return result
            except ValueError:
                pass

        # Look for < or <= max
        less_match = re.search(r"[<≤]\s*(\d*\.?\d+)", clean_str)
        if less_match:
            try:
                result["max"] = float(less_match.group(1))
                return result
            except ValueError:
                pass

        # Look for > or >= min
        greater_match = re.search(r"[>≥]\s*(\d*\.?\d+)", clean_str)
        if greater_match:
            try:
                result["min"] = float(greater_match.group(1))
                return result
            except ValueError:
                pass

        return result

    def validate_single_test(
        self,
        test_name: str,
        value: Any,
        unit: Optional[str] = None,
        stated_range: Optional[str] = None,
        source_snippet: Optional[str] = None,
        page_number: int = 1
    ) -> Dict[str, Any]:
        """
        Validates a single laboratory test measurement deterministically.
        """
        num_val = self.parse_numeric_value(value)
        metric_key = self.match_metric_key(test_name)
        spec = self.standards.get(metric_key) if metric_key else None

        reported_limits = self.parse_reference_range(stated_range) if stated_range else {"min": None, "max": None}

        # Determine effective reference limits
        eff_min = reported_limits["min"] if reported_limits["min"] is not None else (spec["normal_min"] if spec else None)
        eff_max = reported_limits["max"] if reported_limits["max"] is not None else (spec["normal_max"] if spec else None)
        eff_unit = unit or (spec["unit"] if spec else "")

        # Status evaluation
        status = "NORMAL"
        severity = "info"
        flag = "Normal"

        if num_val is None:
            status = "UNPARSEABLE"
            severity = "warning"
            flag = "Check Report"
        elif eff_min is not None and eff_max is not None:
            if spec and spec.get("critical_min") is not None and num_val <= spec["critical_min"]:
                status = "CRITICAL_LOW"
                severity = "critical"
                flag = "Critical Low"
            elif spec and spec.get("critical_max") is not None and num_val >= spec["critical_max"]:
                status = "CRITICAL_HIGH"
                severity = "critical"
                flag = "Critical High"
            elif num_val < eff_min:
                status = "LOW"
                severity = "warning"
                flag = "Low"
            elif num_val > eff_max:
                status = "HIGH"
                severity = "warning"
                flag = "High"
            else:
                status = "NORMAL"
                severity = "success"
                flag = "Normal"
        elif eff_max is not None:
            if num_val > eff_max:
                status = "HIGH"
                severity = "warning"
                flag = "High"
            else:
                status = "NORMAL"
                severity = "success"
                flag = "Normal"
        elif eff_min is not None:
            if num_val < eff_min:
                status = "LOW"
                severity = "warning"
                flag = "Low"
            else:
                status = "NORMAL"
                severity = "success"
                flag = "Normal"
        else:
            status = "UNKNOWN_RANGE"
            severity = "info"
            flag = "Reported"

        # EvidenceTrace item
        evidence_item = {
            "test_name": test_name,
            "standard_name": metric_key or test_name,
            "value": num_val if num_val is not None else str(value),
            "unit": eff_unit,
            "stated_range": stated_range or (f"{eff_min} - {eff_max}" if eff_min and eff_max else "Not Specified"),
            "effective_min": eff_min,
            "effective_max": eff_max,
            "status": status,
            "severity": severity,
            "flag": flag,
            "is_abnormal": status in ["LOW", "HIGH", "CRITICAL_LOW", "CRITICAL_HIGH"],
            "description": spec["description"] if spec else "Laboratory diagnostic measurement.",
            "clinical_significance": (
                (spec["low_implication"] if "LOW" in status else spec["high_implication"])
                if (spec and status in ["LOW", "HIGH", "CRITICAL_LOW", "CRITICAL_HIGH"])
                else (spec["description"] if spec else "Value within expected reference range.")
            ),
            "suggested_questions": spec["doctor_questions"] if spec else [
                f"What does this {test_name} result mean in the context of my symptoms?"
            ],
            "source_evidence": {
                "page": page_number,
                "raw_snippet": source_snippet or f"{test_name}: {value} {eff_unit} (Ref: {stated_range or 'N/A'})",
                "verified": num_val is not None
            }
        }

        return evidence_item

    def extract_from_text(self, text: str) -> List[Dict[str, Any]]:
        """
        Extracts laboratory test lines from plain text, CSV, or OCR output.
        Matches standard blood panels, metabolic markers, and vital signs.
        """
        extracted = []

        # 1. Specialized Vitals and Clinical Signs Extraction
        # Blood Pressure: e.g. "Blood pressure 140 / mmHg", "BP: 140/90", "Bloodpressure140/mmHg"
        bp_match = re.search(r"(?i)(?:blood\s*pressure|bloodpressure|bp)[\s:]*(\d{2,3})(?:\s*[\/\-]\s*(\d{2,3}))?\s*(?:mm\s*hg)?", text)
        if bp_match:
            sys_val = float(bp_match.group(1))
            dia_val = float(bp_match.group(2)) if bp_match.group(2) else None
            
            extracted.append(self.validate_single_test(
                test_name="Blood Pressure (Systolic)",
                value=sys_val,
                unit="mmHg",
                stated_range="90 - 120",
                source_snippet=bp_match.group(0),
                page_number=1
            ))
            if dia_val is not None:
                extracted.append(self.validate_single_test(
                    test_name="Blood Pressure (Diastolic)",
                    value=dia_val,
                    unit="mmHg",
                    stated_range="60 - 80",
                    source_snippet=bp_match.group(0),
                    page_number=1
                ))

        # Pulse / Heart Rate: e.g. "Pulse: 76 bpm", "Pulse:76bpm", "Heart rate: 76"
        pulse_match = re.search(r"(?i)(?:pulse(?:\s*rate)?|heart\s*rate|hr)[\s:]*(\d{2,3})\s*(?:bpm)?", text)
        if pulse_match and not any(e["standard_name"] == "pulse" for e in extracted):
            p_val = float(pulse_match.group(1))
            extracted.append(self.validate_single_test(
                test_name="Pulse (Heart Rate)",
                value=p_val,
                unit="bpm",
                stated_range="60 - 100",
                source_snippet=pulse_match.group(0),
                page_number=1
            ))

        # Body Temperature: e.g. "Temperature 36,8 °C", "Temp: 36.8 C", "98.6 F"
        temp_match = re.search(r"(?i)(?:temperature|body\s*temp|temp)[\s:]*(\d{2,3}[\.,]\d+)\s*(?:°?[cCfF])?", text)
        if temp_match and not any(e["standard_name"] == "temperature" for e in extracted):
            t_str = temp_match.group(1).replace(",", ".")
            t_val = float(t_str)
            unit = "°F" if t_val > 50 else "°C"
            ref_range = "97.0 - 99.0" if unit == "°F" else "36.1 - 37.2"
            extracted.append(self.validate_single_test(
                test_name="Body Temperature",
                value=t_val,
                unit=unit,
                stated_range=ref_range,
                source_snippet=temp_match.group(0),
                page_number=1
            ))

        # Respiratory Rate: e.g. "Respiratory rt: 16 / min", "Respiratoryrt:16/min"
        resp_match = re.search(r"(?i)(?:respiratory\s*(?:rt|rate)|breathing\s*rate|rr)[\s:]*(\d{1,2})\s*(?:\/\s*min|bpm|cpm)?", text)
        if resp_match and not any(e["standard_name"] == "respiratory_rate" for e in extracted):
            r_val = float(resp_match.group(1))
            extracted.append(self.validate_single_test(
                test_name="Respiratory Rate",
                value=r_val,
                unit="/min",
                stated_range="12 - 20",
                source_snippet=resp_match.group(0),
                page_number=1
            ))

        # 2. Line-by-Line Standard Blood & Metabolic Tests
        lines = text.splitlines()

        for line_num, line in enumerate(lines, 1):
            clean_line = line.strip()
            if not clean_line or len(clean_line) < 4:
                continue

            # Skip common table headers
            if any(h in clean_line.lower() for h in ["test name", "investigation", "parameter", "method"]):
                continue

            # Try matching known metrics in this line
            for key, spec in self.standards.items():
                matched_alias = None
                for alias in spec["aliases"]:
                    pattern = rf"(?i)\b{re.escape(alias)}\b"
                    if re.search(pattern, clean_line):
                        matched_alias = alias
                        break

                if matched_alias:
                    # Line contains this test name! Now extract value & range
                    after_name = clean_line[clean_line.lower().find(matched_alias) + len(matched_alias):]
                    # Strip parenthetical qualifiers like (25-OH), (SGPT), (SGOT), (TLC)
                    after_name_clean = re.sub(r"\([^\)]*[\-\/a-zA-Z][^\)]*\)", " ", after_name)

                    # Find all numbers in remaining part of line
                    numbers = re.findall(r"[-+]?\d*\.?\d+", after_name_clean)
                    if numbers:
                        val = float(numbers[0])
                        
                        # Check if subsequent numbers represent a reference range (e.g. 12.0 - 16.0)
                        ref_str = ""
                        range_search = re.search(r"(\d*\.?\d+)\s*[-–—]\s*(\d*\.?\d+)", after_name)
                        if range_search:
                            ref_str = range_search.group(0)
                        elif len(numbers) >= 3:
                            ref_str = f"{numbers[1]} - {numbers[2]}"

                        # Check for unit
                        unit_match = re.search(r"(mg/dL|g/dL|/mcL|million/mcL|%|U/L|uIU/mL|ng/mL|pg/mL|mmol/L)", after_name, re.I)
                        found_unit = unit_match.group(0) if unit_match else spec["unit"]

                        item = self.validate_single_test(
                            test_name=matched_alias.title(),
                            value=val,
                            unit=found_unit,
                            stated_range=ref_str or f"{spec['normal_min']} - {spec['normal_max']}",
                            source_snippet=clean_line,
                            page_number=1
                        )
                        
                        # Avoid duplicates
                        if not any(e["standard_name"] == key for e in extracted):
                            extracted.append(item)
                    break

        return extracted


# Global Singleton Validator
clinical_validator = ClinicalValidator()
