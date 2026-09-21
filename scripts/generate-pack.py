import os
import zipfile
import hashlib
from pathlib import Path

root = Path(__file__).resolve().parent.parent
public_dir = root / "site" / "public"
public_dir.mkdir(parents=True, exist_ok=True)
zip_path = public_dir / "void-vault-evaluator-pack.zip"

dirs_to_pack = ["docs", "data"]
files_to_pack = ["README.md", "CHANGELOG.md"]

entries = []

# Collect files
for d in dirs_to_pack:
    p = root / d
    if p.is_dir():
        for f in p.rglob("*"):
            if f.is_file() and not f.name.startswith("."):
                rel = f.relative_to(root)
                entries.append((f, str(rel).replace("\\", "/")))

for f_name in files_to_pack:
    f = root / f_name
    if f.is_file():
        entries.append((f, f_name))

# Create zip
with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
    # Add manifest
    manifest_lines = ["VOID VAULT — OFFLINE EVALUATOR PACK", "==================================", "", "Included Artifacts:"]
    for src, arcname in entries:
        zf.write(src, arcname)
        manifest_lines.append(f" - {arcname}")
    
    manifest_lines.append("")
    manifest_lines.append("All specifications are aligned with NIST SP 800-88 Rev. 2 & BSA 2023 Sec 63.")
    manifest_lines.append("Repository: https://github.com/nishchaydev/Void-Vault")
    zf.writestr("MANIFEST.txt", "\n".join(manifest_lines))

# Compute SHA-256
h = hashlib.sha256()
with open(zip_path, "rb") as f:
    while chunk := f.read(65536):
        h.update(chunk)

sha256 = h.hexdigest()
print(f"PACK GENERATED: {zip_path}")
print(f"SIZE: {zip_path.stat().st_size} bytes")
print(f"SHA-256: {sha256}")
