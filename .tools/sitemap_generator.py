import os
import datetime

# Configuration
BASE_URL = "https://elwa2.github.io/portfolio/"
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_FILE = os.path.join(ROOT_DIR, "sitemap.xml")

# Files/Directories to exclude
EXCLUDED_DIRS = {'.git', '.tools', 'assets', '.github', '.vscode', 'node_modules'}
EXCLUDED_FILES = {'404.html', 'google8e750b5ef0305514.html'}

def get_html_files(root_dir):
    html_files = []
    for root, dirs, files in os.walk(root_dir):
        # Filter directories in-place
        dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]
        
        for file in files:
            if file.lower().endswith('.html') and file not in EXCLUDED_FILES:
                full_path = os.path.join(root, file)
                html_files.append(full_path)
    return html_files

def generate_sitemap(files):
    sitemap_content = ['<?xml version="1.0" encoding="UTF-8"?>']
    sitemap_content.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    
    for file_path in files:
        # Calculate relative path properly
        rel_path = os.path.relpath(file_path, ROOT_DIR)
        
        # Convert backslashes to forward slashes for URL
        url_path = rel_path.replace(os.path.sep, '/')
        
        # Handle index.html specifically if needed (canonical URLs often strip index.html)
        # But for GitHub pages, keeping or removing depends on preference. 
        # Leaving it as is is usually safer for explicit file mapping.
        
        full_url = BASE_URL + url_path
        
        # Get last modified time
        mod_time = os.path.getmtime(file_path)
        last_mod = datetime.datetime.fromtimestamp(mod_time).strftime('%Y-%m-%d')
        
        sitemap_content.append('  <url>')
        sitemap_content.append(f'    <loc>{full_url}</loc>')
        sitemap_content.append(f'    <lastmod>{last_mod}</lastmod>')
        sitemap_content.append('    <changefreq>weekly</changefreq>')
        sitemap_content.append('    <priority>0.8</priority>')
        sitemap_content.append('  </url>')
    
    sitemap_content.append('</urlset>')
    return '\n'.join(sitemap_content)

def main():
    print(f"Scanning directory: {ROOT_DIR}")
    html_files = get_html_files(ROOT_DIR)
    print(f"Found {len(html_files)} HTML files.")
    
    xml_content = generate_sitemap(html_files)
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(xml_content)
    
    print(f"Sitemap generated successfully at: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
