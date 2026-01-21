import os

def generate_tree(path=".", prefix=""):
    entries = sorted(os.listdir(path))
    tree_str = ""
    for index, entry in enumerate(entries):
        full_path = os.path.join(path, entry)
        connector = "└── " if index == len(entries) - 1 else "├── "
        tree_str += prefix + connector + entry + "\n"
        if os.path.isdir(full_path):
            extension = "    " if index == len(entries) - 1 else "│   "
            tree_str += generate_tree(full_path, prefix + extension)
    return tree_str

def main():
    root = os.path.abspath(".")
    structure = f"# Project Structure\n\n```\n{os.path.basename(root)}/\n"
    structure += generate_tree(root)
    structure += "```"

    with open("PROJECT_STRUCTURE.md", "w", encoding="utf-8") as f:
        f.write(structure)

    print("✅ تم إنشاء الملف PROJECT_STRUCTURE.md بنجاح.")

if __name__ == "__main__":
    main()
