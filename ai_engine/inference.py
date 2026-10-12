import os
import torch
from typing import List, Dict, Any, Union
from model import HackathonClassifier, get_device

class Predictor:
    """
    Production-ready inference wrapper for Hackathon models.
    Handles device placement, tensor conversions, and batching.
    """
    def __init__(self, checkpoint_path: str = "checkpoints/best_model.pt", input_dim: int = 64, num_classes: int = 2):
        self.device = get_device()
        self.checkpoint_path = checkpoint_path
        self.input_dim = input_dim
        self.num_classes = num_classes
        self.model = None
        self._load_model()

    def _load_model(self):
        self.model = HackathonClassifier(
            input_dim=self.input_dim,
            hidden_dim=128,
            num_classes=self.num_classes
        ).to(self.device)

        if os.path.exists(self.checkpoint_path):
            checkpoint = torch.load(self.checkpoint_path, map_location=self.device)
            if "model_state_dict" in checkpoint:
                self.model.load_state_dict(checkpoint["model_state_dict"])
            else:
                self.model.load_state_dict(checkpoint)
            print(f"[OK] Loaded checkpoint from {self.checkpoint_path} onto {self.device}")
        else:
            print(f"[!] Checkpoint {self.checkpoint_path} not found. Running with initialized weights.")

        self.model.eval()

    def predict(self, feature_list: List[float]) -> Dict[str, Any]:
        """Runs inference on a single feature vector."""
        if len(feature_list) != self.input_dim:
            raise ValueError(f"Expected {self.input_dim} features, received {len(feature_list)}")

        tensor_in = torch.tensor([feature_list], dtype=torch.float32).to(self.device)
        with torch.no_grad():
            logits = self.model(tensor_in)
            probabilities = torch.softmax(logits, dim=1).cpu().numpy()[0]
            predicted_class = int(torch.argmax(logits, dim=1).item())

        return {
            "predicted_class": predicted_class,
            "probabilities": [round(float(p), 4) for p in probabilities],
            "confidence": round(float(probabilities[predicted_class]), 4),
            "device": str(self.device)
        }

if __name__ == "__main__":
    predictor = Predictor()
    dummy_input = [0.5] * 64
    result = predictor.predict(dummy_input)
    print("Inference Test Result:", result)
