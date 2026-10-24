import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
site_packages = ROOT / ".venv" / "Lib" / "site-packages"
if str(site_packages) not in sys.path:
    sys.path.insert(0, str(site_packages))
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import uvicorn
from backend.app.main import app

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
