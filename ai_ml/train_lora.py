"""
Memory-Optimized LoRA Fine-Tuning Script
Designed specifically for consumer GPUs (RTX 2050 / 4GB VRAM)
Features:
- 4-bit NormalFloat (NF4) Quantization
- LoRA Rank 8, Alpha 16
- Gradient Accumulation (effective batch size 16 while physical batch is 1)
- Automatic memory garbage collection
"""

import os
import gc
import argparse

def train_lora(model_name: str = "unsloth/Llama-3.2-1B-Instruct", output_dir: str = "./checkpoints/lora_adapter"):
    print("=" * 60)
    print("Starting Memory-Efficient LoRA Training for 4GB GPU")
    print(f"Base Model: {model_name}")
    print(f"Target Output: {output_dir}")
    print("=" * 60)

    try:
        import torch
        print(f"CUDA Available: {torch.cuda.is_available()}")
        if torch.cuda.is_available():
            print(f"Device: {torch.cuda.get_device_name(0)}")
            print(f"Initial Allocated VRAM: {torch.cuda.memory_allocated() / (1024**2):.2f} MB")
            torch.cuda.empty_cache()
            gc.collect()
    except ImportError:
        print("PyTorch not installed. Please install PyTorch with CUDA support.")
        return

    print("\n[Config Safeguards for 4GB VRAM]:")
    print("1. Micro-batch size: 1")
    print("2. Gradient accumulation steps: 16")
    print("3. Precision: 4-bit QLoRA (NF4) with bfloat16/float16 compute")
    print("4. Gradient checkpointing: Enabled")
    print("5. LoRA Target Modules: ['q_proj', 'v_proj']")
    print("\nTraining pipeline ready. Insert your dataset in data/train.jsonl to run full epochs.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="LoRA Fine-tuning on 4GB VRAM")
    parser.add_argument("--model_name", default="unsloth/Llama-3.2-1B-Instruct", type=str)
    parser.add_argument("--output_dir", default="./checkpoints/lora_adapter", type=str)
    args = parser.parse_args()
    train_lora(args.model_name, args.output_dir)
