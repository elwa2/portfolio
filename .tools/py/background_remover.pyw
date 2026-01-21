import tkinter as tk
from tkinter import filedialog
import os
import requests
from PIL import Image

def remove_background(image_path, api_key):
    """Removes the background from an image using the remove.bg API."""
    try:
        with open(image_path, 'rb') as image_file:
            response = requests.post(
                'https://api.remove.bg/v1.0/removebg',
                files={'image_file': image_file},
                data={'size': 'auto'},
                headers={'X-Api-Key': api_key},
            )

        if response.status_code == requests.codes.ok:
            return response.content
        else:
            print(f"Error removing background for {image_path}: Status Code {response.status_code}, Message: {response.text}")
            return None
    except Exception as e:
        print(f"Error processing {image_path}: {e}")
        return None

def process_folder(folder_path, api_key):
    """Processes all image files in the selected folder and its subfolders."""
    image_extensions = ['.png', '.jpg', '.jpeg', '.bmp', '.gif', '.webp']
    for root, _, files in os.walk(folder_path):
        for file in files:
            if any(file.lower().endswith(ext) for ext in image_extensions):
                image_path = os.path.join(root, file)
                print(f"Processing image: {image_path}")
                output_image_data = remove_background(image_path, api_key)
                if output_image_data:
                    try:
                        output_image_path = os.path.splitext(image_path)[0] + "_no_bg.png" # Save as PNG to support transparency
                        with open(output_image_path, 'wb') as output_file:
                            output_file.write(output_image_data)
                        print(f"Background removed and saved to: {output_image_path}")
                    except Exception as e:
                        print(f"Error saving processed image {image_path}: {e}")

    tk.messagebox.showinfo("Complete", "Background removal process completed.")


def select_folder():
    """Opens a folder selection dialog and processes the selected folder."""
    folder_selected = filedialog.askdirectory()
    if folder_selected:
        api_key = api_key_entry.get()
        if api_key:
            process_folder(folder_selected, api_key)
        else:
            tk.messagebox.showerror("Error", "API key is required.")
    else:
        tk.messagebox.showinfo("Info", "No folder selected.")

# Main application window
root = tk.Tk()
root.title("Background Remover")

# API Key Entry
api_key_label = tk.Label(root, text="API Key:")
api_key_label.pack(pady=5)
api_key_entry = tk.Entry(root, width=50)
api_key_entry.pack(pady=5)
api_key_entry.insert(0, "vzmAWfTyDx9KGZ4EgDKtot4s") # Pre-fill with the provided API key

# Select Folder Button
select_button = tk.Button(root, text="Select Folder and Remove Background", command=select_folder)
select_button.pack(pady=20)

root.mainloop()