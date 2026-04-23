"""Deploy Nexus Fit API to HuggingFace Spaces."""
from huggingface_hub import HfApi
import os

TOKEN = input("Paste your HuggingFace token: ").strip()
REPO_ID = "HimanshuML24/nexus-fit-api"

# Get absolute path of project root
ROOT = os.path.dirname(os.path.abspath(__file__))

api = HfApi(token=TOKEN)

print("\n🚀 Uploading to HuggingFace Spaces...")
print(f"   Repo: {REPO_ID}")

# Upload Dockerfile
print("   📦 Uploading Dockerfile...")
api.upload_file(
    path_or_fileobj=os.path.join(ROOT, "api", "Dockerfile"),
    path_in_repo="Dockerfile",
    repo_id=REPO_ID,
    repo_type="space",
)

# Upload README.md for HF
print("   📦 Uploading README.md...")
api.upload_file(
    path_or_fileobj=os.path.join(ROOT, "api", "README.md"),
    path_in_repo="README.md",
    repo_id=REPO_ID,
    repo_type="space",
)

# Upload api folder
print("   📦 Uploading api/ folder...")
api.upload_folder(
    folder_path=os.path.join(ROOT, "api"),
    path_in_repo="api",
    repo_id=REPO_ID,
    repo_type="space",
    ignore_patterns=["venv/*", "__pycache__/*", "*.pyc", ".pytest_cache/*", "test_main.py", "Dockerfile", "README.md"],
)

# Upload ml models
print("   📦 Uploading ml/models/ folder...")
api.upload_folder(
    folder_path=os.path.join(ROOT, "ml", "models"),
    path_in_repo="ml/models",
    repo_id=REPO_ID,
    repo_type="space",
)

print("\n✅ Deployment complete!")
print(f"   Your API: https://himanshuml24-nexus-fit-api.hf.space")
print(f"   Docs: https://himanshuml24-nexus-fit-api.hf.space/docs")