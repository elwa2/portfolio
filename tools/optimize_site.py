import os
import glob
import re
from PIL import Image

def optimize_images(directory):
    """Optimizes images in the given directory (resize and compress)."""
    print(f"Scanning for images in: {directory}...")
    
    # Extensions to look for
    extensions = ['*.jpg', '*.jpeg', '*.png']
    files = []
    
    for ext in extensions:
        files.extend(glob.glob(os.path.join(directory, '**', ext), recursive=True))
        
    print(f"Found {len(files)} images.")
    
    count = 0
    saved_space = 0
    
    for file_path in files:
        try:
            # Skip if already optimized (simple check if filename ends with .min.ext or similar? No, just overwrite for now or skip small files)
            original_size = os.path.getsize(file_path)
            
            # Skip small files (< 100KB)
            if original_size < 100 * 1024:
                continue
                
            img = Image.open(file_path)
            
            # Resize if too large (max width 1920)
            max_width = 1920
            if img.width > max_width:
                ratio = max_width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
            
            # Save with optimization
            if file_path.lower().endswith('.png'):
                # convert to optimized png is tricky with PIL, keeping it simple or convert to webp?
                # For now, just optimize current format
                img.save(file_path, optimize=True, quality=85)
            elif file_path.lower().endswith(('.jpg', '.jpeg')):
                img.save(file_path, optimize=True, quality=80)
                
            new_size = os.path.getsize(file_path)
            diff = original_size - new_size
            
            if diff > 0:
                saved_space += diff
                count += 1
                print(f"Optimized: {os.path.basename(file_path)} (Saved {diff/1024:.2f} KB)")
                
        except Exception as e:
            print(f"Error optimizing {file_path}: {e}")

    print(f"Image optimization complete. Optimized {count} images. Total saved: {saved_space/1024/1024:.2f} MB")

def minify_css(file_path):
    """Minifies a CSS file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        original_size = len(content)
        
        # Remove comments
        content = re.sub(r'/\*[\s\S]*?\*/', '', content)
        # Remove whitespace
        content = re.sub(r'\s+', ' ', content)
        content = re.sub(r'\s*([\{\};:,])\s*', r'\1', content)
        content = content.replace(';}', '}')
        
        min_file_path = file_path.replace('.css', '.min.css')
        
        with open(min_file_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
        new_size = len(content)
        print(f"Minified CSS: {os.path.basename(file_path)} -> {os.path.basename(min_file_path)} (Saved {(original_size - new_size)/1024:.2f} KB)")
        return min_file_path
        
    except Exception as e:
        print(f"Error minifying CSS {file_path}: {e}")
        return None

def minify_js(file_path):
    """Minifies a JS file (Simple minification)."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        original_size = len(content)
        
        # Simple regex based minification (Not perfect but works for simple scripts)
        # Remove single line comments
        content = re.sub(r'//.*', '', content)
        # Remove multi-line comments
        content = re.sub(r'/\*[\s\S]*?\*/', '', content)
        # Remove whitespace around delimiters
        content = re.sub(r'\s*([\{\};:,=])\s*', r'\1', content)
        
        min_file_path = file_path.replace('.js', '.min.js')
        
        with open(min_file_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
        new_size = len(content)
        print(f"Minified JS: {os.path.basename(file_path)} -> {os.path.basename(min_file_path)} (Saved {(original_size - new_size)/1024:.2f} KB)")
        return min_file_path
        
    except Exception as e:
        print(f"Error minifying JS {file_path}: {e}")
        return None

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    assets_dir = os.path.join(base_dir, 'assets')
    
    print("Starting optimization...")
    
    # Optimize Images
    img_dir = os.path.join(assets_dir, 'images')
    optimize_images(img_dir)
    
    # Minify CSS
    css_dir = os.path.join(assets_dir, 'css')
    css_files = glob.glob(os.path.join(css_dir, '*.css'))
    for css_file in css_files:
        if not css_file.endswith('.min.css'):
            minify_css(css_file)
            
    # Minify JS
    js_dir = os.path.join(assets_dir, 'js')
    js_files = glob.glob(os.path.join(js_dir, '*.js'))
    for js_file in js_files:
        if not js_file.endswith('.min.js'):
            minify_js(js_file)
            
    print(" Optimization complete!")
    print(" NOTE: To use minified files, you need to update HTML references.")
    print(" (This script only creates the .min files, it does not update HTML)")

if __name__ == "__main__":
    main()
