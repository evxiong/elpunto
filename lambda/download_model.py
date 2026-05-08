"""
Script for downloading `all-MiniLM-L6-v2` model to `src/all-MiniLM-L6-v2`.

If the directory already exists, this script does nothing.
"""

from pathlib import Path


def main():
    dir = "src/all-MiniLM-L6-v2"
    path = Path(dir)

    if not (path.is_dir() and any(path.iterdir())):
        print("Downloading `all-MiniLM-L6-v2`...")
        from sentence_transformers import SentenceTransformer

        model = SentenceTransformer("all-MiniLM-L6-v2")
        model.save(dir)


if __name__ == "__main__":
    main()
