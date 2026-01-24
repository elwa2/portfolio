import os
import datetime

# Configuration
BASE_URL = "https://elwa2.github.io/portfolio/"
# Use script location to find root (.tools is one level deep)
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_FILE = os.path.join(ROOT_DIR, "sitemap.xml")

# Files/Directories to exclude from crawling
EXCLUDED_DIRS = {'.git', '.tools', 'assets', '.github', '.vscode', 'node_modules', '__pycache__'}
EXCLUDED_FILES = {'404.html', 'google8e750b5ef0305514.html', 'test_redirect.html'}

def get_html_files(root_dir):
    """Scans the directory for .html files recursively."""
    html_files = []
    print(f"Scanning directory: {root_dir}...")
    
    for root, dirs, files in os.walk(root_dir):
        # Modify dirs in-place to skip excluded directories
        dirs[:] = [d for d in dirs if d not in EXCLUDED_DIRS]
        
        for file in files:
            if file.lower().endswith('.html') and file not in EXCLUDED_FILES:
                full_path = os.path.join(root, file)
                html_files.append(full_path)
                print(f"Found: {file}")
                
    return html_files

def generate_sitemap(files):
    """Generates the XML string for the sitemap."""
    sitemap_content = ['<?xml version="1.0" encoding="UTF-8"?>']
    sitemap_content.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    
    # Get current date for lastmod if we want a global update, 
    # but better to use file modification time.
    
    for file_path in files:
        # Calculate relative path from root
        rel_path = os.path.relpath(file_path, ROOT_DIR)
        
        # Normalize slashes for URL
        url_path = rel_path.replace(os.path.sep, '/')
        
        # Construct full URL
        full_url = BASE_URL + url_path
        
        # Get file modification time
        try:
            mod_time = os.path.getmtime(file_path)
            last_mod = datetime.datetime.fromtimestamp(mod_time).strftime('%Y-%m-%d')
        except:
            last_mod = datetime.datetime.now().strftime('%Y-%m-%d')
            
        # Determine priority based on depth or specific files
        priority = "0.8"
        if url_path == "index.html":
            priority = "1.0"
        elif "/" in url_path: # Deeper files
            priority = "0.7"
        
        # Add entry
        sitemap_content.append('  <url>')
        sitemap_content.append(f'    <loc>{full_url}</loc>')
        sitemap_content.append(f'    <lastmod>{last_mod}</lastmod>')
        sitemap_content.append('    <changefreq>weekly</changefreq>')
        sitemap_content.append(f'    <priority>{priority}</priority>')
        sitemap_content.append('  </url>')
    
    sitemap_content.append('</urlset>')
    return '\n'.join(sitemap_content)

def main():
    try:
        html_files = get_html_files(ROOT_DIR)
        xml_content = generate_sitemap(html_files)
        
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            f.write(xml_content)
        
        print("-" * 30)
        print(f"✅ Success! Sitemap generated at:\n{OUTPUT_FILE}")
        print(f"Total URLs: {len(html_files)}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        input("Press Enter to exit...")

if __name__ == "__main__":
    main()
