import os
import argparse
import time
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
from model import HackathonClassifier, get_device

def train_epoch(model, dataloader, criterion, optimizer, device):
    model.train()
    total_loss = 0.0
    correct = 0
    total = 0

    for x_batch, y_batch in dataloader:
        x_batch, y_batch = x_batch.to(device), y_batch.to(device)
        
        optimizer.zero_grad()
        outputs = model(x_batch)
        loss = criterion(outputs, y_batch)
        loss.backward()
        optimizer.step()

        total_loss += loss.item() * len(y_batch)
        _, preds = torch.max(outputs, 1)
        correct += (preds == y_batch).sum().item()
        total += len(y_batch)

    return total_loss / total, correct / total

def eval_epoch(model, dataloader, criterion, device):
    model.eval()
    total_loss = 0.0
    correct = 0
    total = 0

    with torch.no_grad():
        for x_batch, y_batch in dataloader:
            x_batch, y_batch = x_batch.to(device), y_batch.to(device)
            outputs = model(x_batch)
            loss = criterion(outputs, y_batch)

            total_loss += loss.item() * len(y_batch)
            _, preds = torch.max(outputs, 1)
            correct += (preds == y_batch).sum().item()
            total += len(y_batch)

    return total_loss / total, correct / total

def main():
    parser = argparse.ArgumentParser(description="Hackathon AI Training Pipeline")
    parser.add_argument("--epochs", type=int, default=10, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=32, help="Batch size (reduce to 16 if VRAM is low)")
    parser.add_argument("--lr", type=float, default=0.001, help="Learning rate")
    parser.add_argument("--input_dim", type=int, default=64, help="Input feature dimension")
    parser.add_argument("--num_classes", type=int, default=2, help="Number of target classes")
    parser.add_argument("--save_path", type=str, default="checkpoints/best_model.pt", help="Path to save weights")
    args = parser.parse_args()

    device = get_device()
    print(f"==================================================")
    print(f"🚀 Starting AI Model Training Pipeline")
    print(f"📍 Compute Device: {device} ({torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'})")
    if torch.cuda.is_available():
        vram_mb = torch.cuda.get_device_properties(0).total_memory / (1024 * 1024)
        print(f"💾 Total VRAM: {vram_mb:.0f} MB")
    print(f"==================================================")

    # Generate synthetic benchmark dataset for quick hackathon verification
    print("📦 Generating dataset samples...")
    num_samples = 1000
    x_data = torch.randn(num_samples, args.input_dim)
    y_data = torch.randint(0, args.num_classes, (num_samples,))

    split_idx = int(0.8 * num_samples)
    train_ds = TensorDataset(x_data[:split_idx], y_data[:split_idx])
    val_ds = TensorDataset(x_data[split_idx:], y_data[split_idx:])

    train_loader = DataLoader(train_ds, batch_size=args.batch_size, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=args.batch_size, shuffle=False)

    # Initialize model, loss, optimizer
    model = HackathonClassifier(
        input_dim=args.input_dim,
        hidden_dim=128,
        num_classes=args.num_classes
    ).to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=1e-4)

    os.makedirs(os.path.dirname(args.save_path) or ".", exist_ok=True)
    best_val_acc = 0.0

    print(f"⚡ Training for {args.epochs} epochs...\n")
    start_time = time.time()

    for epoch in range(1, args.epochs + 1):
        t0 = time.time()
        train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer, device)
        val_loss, val_acc = eval_epoch(model, val_loader, criterion, device)
        epoch_time = time.time() - t0

        print(f"Epoch [{epoch:02d}/{args.epochs:02d}] ({epoch_time:.2f}s) | "
              f"Train Loss: {train_loss:.4f} Acc: {train_acc*100:.1f}% | "
              f"Val Loss: {val_loss:.4f} Acc: {val_acc*100:.1f}%")

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save({
                "epoch": epoch,
                "model_state_dict": model.state_dict(),
                "optimizer_state_dict": optimizer.state_dict(),
                "val_acc": val_acc,
                "input_dim": args.input_dim,
                "num_classes": args.num_classes
            }, args.save_path)
            print(f"   ⭐ Saved best checkpoint to: {args.save_path}")

    total_time = time.time() - start_time
    print(f"\n✅ Training completed in {total_time:.2f} seconds!")
    print(f"🏆 Best Validation Accuracy: {best_val_acc*100:.2f}%")
    print(f"📁 Checkpoint stored at: {os.path.abspath(args.save_path)}")

if __name__ == "__main__":
    main()
