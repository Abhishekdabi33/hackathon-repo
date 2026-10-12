import torch
import torch.nn as nn
from typing import Optional

class HackathonClassifier(nn.Module):
    """
    Lightweight, modular PyTorch neural network architecture.
    Optimized for rapid training on mid-range GPUs (like 4GB Quadro / GTX)
    and fast CPU fallback.
    """
    def __init__(self, input_dim: int = 64, hidden_dim: int = 128, num_classes: int = 2, dropout: float = 0.2):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.BatchNorm1d(hidden_dim),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.BatchNorm1d(hidden_dim // 2),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim // 2, num_classes)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)


def get_device() -> torch.device:
    """Helper to detect and return best available compute device."""
    if torch.cuda.is_available():
        return torch.device("cuda")
    return torch.device("cpu")
