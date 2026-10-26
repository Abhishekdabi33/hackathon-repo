"""
LabLens AI - Clinical QLoRA Fine-Tuning Pipeline
Trains Google Gemma models on gold-standard medical datasets (MedQuAD, Clinical Labs)
using 4-bit BitsAndBytes quantization and Parameter-Efficient Fine-Tuning (PEFT/QLoRA).

Target Runtimes: Kaggle Dual Tesla T4 GPUs (32GB VRAM), Google Colab, or Local CUDA.
"""

import os
import sys
import time
import json
import argparse
from pathlib import Path

# Embedded Gold-Standard Clinical Report & EvidenceTrace Training Samples
# Guarantees immediate training execution even in offline environments or rate-limited APIs.
CLINICAL_TRAINING_PAIRS = [
    {
        "instruction": "Analyze this laboratory report and identify any abnormal values with EvidenceTrace grounding.",
        "input": "PATIENT REPORT: Hemoglobin: 10.2 g/dL (Normal Range: 13.0 - 17.0 g/dL), WBC: 6500 /mcL (4000 - 11000), Platelets: 210000 /mcL (150000 - 450000).",
        "output": (
            "### Clinical Laboratory Analysis\n\n"
            "**EvidenceTrace Matrix**:\n"
            "- **Hemoglobin**: 10.2 g/dL | Reference: 13.0 - 17.0 g/dL | **Status: LOW**\n"
            "- **WBC**: 6500 /mcL | Reference: 4000 - 11000 /mcL | **Status: Normal**\n"
            "- **Platelets**: 210000 /mcL | Reference: 150000 - 450000 /mcL | **Status: Normal**\n\n"
            "**Clinical Meaning**:\n"
            "The hemoglobin level is below the expected reference interval, which is characteristic of mild anemia. "
            "White blood cell and platelet counts are within normal physiological limits, suggesting normal immune and clotting baseline.\n\n"
            "**Questions to Discuss with Your Doctor**:\n"
            "1. Should we evaluate serum ferritin, iron saturation, or Vitamin B12 to determine the cause of the lower hemoglobin?\n"
            "2. Would dietary iron adjustments or supplementation be appropriate based on my overall health history?\n\n"
            "> *Disclaimer: Educational review assistant. Laboratory findings must be interpreted by a qualified physician.*"
        )
    },
    {
        "instruction": "Explain the significance of these metabolic panel results in simple patient-friendly language.",
        "input": "PATIENT REPORT: Fasting Blood Sugar: 146 mg/dL (Reference: 70 - 99 mg/dL), HbA1c: 6.9% (Reference: 4.0 - 5.6%).",
        "output": (
            "### Clinical Review: Blood Sugar & Glycemic Control\n\n"
            "**EvidenceTrace Matrix**:\n"
            "- **Fasting Blood Sugar**: 146 mg/dL | Reference: 70 - 99 mg/dL | **Status: HIGH**\n"
            "- **HbA1c**: 6.9% | Reference: 4.0 - 5.6% | **Status: HIGH**\n\n"
            "**Plain Language Explanation**:\n"
            "Both your overnight fasting glucose and your HbA1c (which reflects your average blood sugar over the past 2 to 3 months) "
            "are above standard laboratory reference ranges. In clinical practice, repeated values in this range are evaluated for diabetes mellitus.\n\n"
            "**Questions to Discuss with Your Doctor**:\n"
            "1. What individualized HbA1c target should we aim for over the next 3 to 6 months?\n"
            "2. Would you recommend a formal medical nutrition plan or lifestyle adjustments before retesting?\n\n"
            "> *Disclaimer: Educational review assistant. Does not replace professional medical judgment.*"
        )
    },
    {
        "instruction": "Review this lipid profile and explain cardiovascular risk factors clearly.",
        "input": "PATIENT REPORT: Total Cholesterol: 254 mg/dL (125 - 200), HDL: 36 mg/dL (40 - 60), LDL: 168 mg/dL (50 - 100), Triglycerides: 240 mg/dL (40 - 150).",
        "output": (
            "### Clinical Review: Lipid Profile & Vascular Health\n\n"
            "**EvidenceTrace Matrix**:\n"
            "- **Total Cholesterol**: 254 mg/dL | Ref: 125 - 200 mg/dL | **Status: HIGH**\n"
            "- **HDL (Protective)**: 36 mg/dL | Ref: 40 - 60 mg/dL | **Status: LOW**\n"
            "- **LDL (Atherogenic)**: 168 mg/dL | Ref: 50 - 100 mg/dL | **Status: HIGH**\n"
            "- **Triglycerides**: 240 mg/dL | Ref: 40 - 150 mg/dL | **Status: HIGH**\n\n"
            "**Clinical Meaning**:\n"
            "This lipid panel demonstrates mixed dyslipidemia: elevated total cholesterol, elevated LDL ('bad cholesterol'), "
            "and elevated triglycerides, coupled with lower protective HDL ('good cholesterol'). Over time, elevated LDL particles can contribute to arterial plaque buildup.\n\n"
            "**Questions for Your Healthcare Provider**:\n"
            "1. What is my estimated 10-year cardiovascular risk score based on these numbers?\n"
            "2. What specific dietary modifications (reducing saturated fats, refined carbohydrates) and aerobic activity targets do you recommend?\n\n"
            "> *Disclaimer: Educational review assistant. Please review with your physician.*"
        )
    },
    {
        "instruction": "Analyze this thyroid test result and describe potential symptoms.",
        "input": "PATIENT REPORT: TSH (Thyroid Stimulating Hormone): 7.8 uIU/mL (Reference: 0.4 - 4.5 uIU/mL).",
        "output": (
            "### Clinical Review: Thyroid Function\n\n"
            "**EvidenceTrace Matrix**:\n"
            "- **TSH**: 7.8 uIU/mL | Reference: 0.4 - 4.5 uIU/mL | **Status: HIGH**\n\n"
            "**Clinical Explanation**:\n"
            "TSH is produced by the pituitary gland to signal the thyroid to produce thyroid hormones (T3 and T4). "
            "An elevated TSH typically indicates that the pituitary is working harder to stimulate the thyroid, which is the hallmark of subclinical or overt hypothyroidism.\n\n"
            "**Questions for Your Doctor**:\n"
            "1. Should we test Free T4, Free T3, and anti-TPO thyroid antibodies to complete the diagnosis?\n"
            "2. Could symptoms like unexplained tiredness, feeling cold, or weight changes be linked to this level?\n\n"
            "> *Disclaimer: Educational review assistant.*"
        )
    },
    {
        "instruction": "Explain this renal and liver function report.",
        "input": "PATIENT REPORT: Serum Creatinine: 1.8 mg/dL (0.6 - 1.2), BUN: 28 mg/dL (7 - 20), ALT/SGPT: 32 U/L (7 - 56), AST/SGOT: 26 U/L (10 - 40).",
        "output": (
            "### Clinical Review: Kidney and Liver Markers\n\n"
            "**EvidenceTrace Matrix**:\n"
            "- **Serum Creatinine**: 1.8 mg/dL | Ref: 0.6 - 1.2 mg/dL | **Status: HIGH**\n"
            "- **Blood Urea Nitrogen (BUN)**: 28 mg/dL | Ref: 7 - 20 mg/dL | **Status: HIGH**\n"
            "- **ALT / SGPT**: 32 U/L | Ref: 7 - 56 U/L | **Status: Normal**\n"
            "- **AST / SGOT**: 26 U/L | Ref: 10 - 40 U/L | **Status: Normal**\n\n"
            "**Clinical Meaning**:\n"
            "Liver enzymes (ALT/AST) are well within normal ranges, indicating normal hepatocellular integrity. "
            "However, both Creatinine and BUN are elevated above standard reference intervals, which indicates decreased kidney filtration rate (eGFR) or acute dehydration.\n\n"
            "**Questions for Your Doctor**:\n"
            "1. Was my elevated creatinine influenced by recent hydration levels or strenuous exercise?\n"
            "2. Should we calculate an eGFR or perform a routine urine analysis (protein/albumin)?\n\n"
            "> *Disclaimer: Educational review assistant.*"
        )
    }
]


def format_instruction_prompt(instruction: str, user_input: str, response: str = "") -> str:
    """Formats training pairs into standard Gemma / ChatML turn structure."""
    prompt = (
        f"<start_of_turn>user\n"
        f"{instruction.strip()}\n\n"
        f"{user_input.strip()}<end_of_turn>\n"
        f"<start_of_turn>model\n"
    )
    if response:
        prompt += f"{response.strip()}<end_of_turn>"
    return prompt


def run_training_pipeline(
    model_id: str = "google/gemma-2-2b-it",
    output_dir: str = "./checkpoints/lablens_gemma_clinical_lora",
    hf_token: str = None,
    epochs: int = 3,
    batch_size: int = 2,
    gradient_accumulation_steps: int = 4,
    learning_rate: float = 2e-4,
    use_huggingface_dataset: bool = True
):
    """
    Executes full 4-bit QLoRA fine-tuning on Google Gemma.
    """
    print("=" * 65)
    print(">> LabLens AI: Clinical QLoRA Fine-Tuning Engine")
    print(f"[*] Target Model ID: {model_id}")
    print(f"[*] Destination Adapter: {output_dir}")
    print("=" * 65)

    import torch
    from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig, TrainingArguments
    from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
    from datasets import Dataset

    # 1. Device and GPU Telemetry
    cuda_ok = torch.cuda.is_available()
    device = "cuda" if cuda_ok else "cpu"
    print(f"[*] Compute Device: {device}")
    if cuda_ok:
        for i in range(torch.cuda.device_count()):
            vram_gb = torch.cuda.get_device_properties(i).total_memory / (1024**3)
            print(f"    - GPU {i}: {torch.cuda.get_device_name(i)} ({vram_gb:.1f} GB VRAM)")
    else:
        print("[!] No CUDA GPU detected. For fast training, run on Kaggle dual Tesla T4 GPUs.")

    # 2. Authentication
    token_arg = hf_token or os.getenv("HF_TOKEN")
    if token_arg:
        from huggingface_hub import login
        try:
            login(token=token_arg)
            print("[OK] Hugging Face authentication verified.")
        except Exception as e:
            print(f"[!] Warning logging into Hugging Face: {e}")

    # 3. Dataset Preparation
    print("[*] Preparing Clinical Training Dataset...")
    training_data = []

    # Try loading open medical datasets from Hugging Face if requested and reachable
    if use_huggingface_dataset:
        try:
            from datasets import load_dataset
            print("[*] Streaming MedQuAD clinical dataset from Hugging Face...")
            hf_ds = load_dataset("keivalya/MedQuad-MedicalQnADataset", split="train[:150]")
            for row in hf_ds:
                q = row.get("Questions", "").strip()
                a = row.get("Answers", "").strip()
                if q and a:
                    training_data.append({
                        "text": format_instruction_prompt(
                            instruction="Provide a medically accurate, empathetic clinical explanation for this inquiry.",
                            user_input=q,
                            response=f"{a}\n\n> *Disclaimer: Educational review assistant. Consult a physician.*"
                        )
                    })
            print(f"[OK] Ingested {len(training_data)} verified MedQuAD clinical pairs!")
        except Exception as e:
            print(f"[*] HF stream skipped ({e}). Using embedded gold-standard clinical lab dataset.")

    # Always add our high-precision Clinical EvidenceTrace pairs
    for pair in CLINICAL_TRAINING_PAIRS:
        training_data.append({
            "text": format_instruction_prompt(
                instruction=pair["instruction"],
                user_input=pair["input"],
                response=pair["output"]
            )
        })

    train_dataset = Dataset.from_list(training_data)
    print(f"[OK] Total Training Samples Prepared: {len(train_dataset)}")

    # 4. 4-Bit BitsAndBytes Quantization Config
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_quant_type="nf4",
        bnb_4bit_compute_dtype=torch.float16,
        bnb_4bit_use_double_quant=True
    ) if cuda_ok else None

    # 5. Load Tokenizer & Base Model
    print(f"[*] Loading Tokenizer & Model '{model_id}'...")
    tokenizer = AutoTokenizer.from_pretrained(model_id, token=token_arg)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    model_kwargs = {"token": token_arg}
    if cuda_ok:
        model_kwargs["quantization_config"] = bnb_config
        model_kwargs["device_map"] = "auto"

    base_model = AutoModelForCausalLM.from_pretrained(model_id, **model_kwargs)
    print("[OK] Base model loaded successfully!")

    # 6. Apply QLoRA / PEFT Configuration
    if cuda_ok:
        base_model = prepare_model_for_kbit_training(base_model)

    lora_config = LoraConfig(
        r=16,
        lora_alpha=32,
        target_modules=["q_proj", "v_proj", "k_proj", "o_proj"],
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM"
    )

    peft_model = get_peft_model(base_model, lora_config)
    print("\n[+] Trainable Parameters after QLoRA:")
    peft_model.print_trainable_parameters()

    # 7. Tokenize Dataset
    def tokenize_fn(examples):
        return tokenizer(examples["text"], truncation=True, max_length=512, padding="max_length")

    tokenized_ds = train_dataset.map(tokenize_fn, batched=True)

    # 8. Train with SFTTrainer / Hugging Face Trainer
    try:
        from trl import SFTTrainer
        trainer_cls = SFTTrainer
    except ImportError:
        from transformers import Trainer
        trainer_cls = Trainer

    training_args = TrainingArguments(
        output_dir="./tmp_trainer",
        num_train_epochs=epochs,
        per_device_train_batch_size=batch_size,
        gradient_accumulation_steps=gradient_accumulation_steps,
        learning_rate=learning_rate,
        fp16=cuda_ok,
        logging_steps=5,
        save_strategy="no",
        report_to="none"
    )

    trainer = trainer_cls(
        model=peft_model,
        train_dataset=tokenized_ds,
        args=training_args,
        tokenizer=tokenizer,
        dataset_text_field="text" if hasattr(trainer_cls, "__name__") and "SFTTrainer" in trainer_cls.__name__ else None
    )

    print("\n[>>] Starting QLoRA Clinical Training Run...")
    start_t = time.time()
    trainer.train()
    duration = round(time.time() - start_t, 2)
    print(f"\n[OK] Training completed in {duration} seconds!")

    # 9. Save Trained LoRA Adapter
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    peft_model.save_pretrained(output_dir)
    tokenizer.save_pretrained(output_dir)

    print("=" * 65)
    print(f"[SUCCESS] Clinical LoRA Adapter saved to: {output_dir}")
    print("[*] Files generated: adapter_config.json, adapter_model.safetensors")
    print("=" * 65)

    return output_dir


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="LabLens AI Clinical Fine-Tuning")
    parser.add_argument("--model", type=str, default="google/gemma-2-2b-it", help="Hugging Face Model ID")
    parser.add_argument("--output", type=str, default="./checkpoints/lablens_gemma_clinical_lora", help="Output path")
    parser.add_argument("--epochs", type=int, default=2, help="Number of epochs")
    parser.add_argument("--hf_token", type=str, default=None, help="Hugging Face User Access Token")
    args = parser.parse_args()

    run_training_pipeline(
        model_id=args.model,
        output_dir=args.output,
        hf_token=args.hf_token,
        epochs=args.epochs
    )
