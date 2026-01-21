import os
import tkinter as tk
from tkinter import filedialog, messagebox
from PIL import Image
import uuid

MIN_DIMENSION = 14000

def resize_images(input_folder, output_folder):
    """
    Resizes images from the input folder and saves them to the output folder.
    Returns True if successful, or an error message string if not.
    """
    try:
        if not os.path.exists(output_folder):
            os.makedirs(output_folder)

        image_files = [f for f in os.listdir(input_folder) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.gif'))]

        if not image_files:
            # This will be caught and shown as a proper messagebox by the caller
            return "No images found in the selected input folder."

        for i, filename in enumerate(image_files):
            input_path = os.path.join(input_folder, filename)
            
            name, ext = os.path.splitext(filename)
            unique_id = uuid.uuid4()
            new_filename = f"{unique_id}{ext}"
            output_path = os.path.join(output_folder, new_filename)

            with Image.open(input_path) as img:
                width, height = img.size
                new_width, new_height = width, height

                should_resize = False
                if width < MIN_DIMENSION or height < MIN_DIMENSION:
                    should_resize = True
                    if width < height:
                        scale_factor = MIN_DIMENSION / width
                        new_width = MIN_DIMENSION
                        new_height = int(height * scale_factor)
                    else:
                        scale_factor = MIN_DIMENSION / height
                        new_height = MIN_DIMENSION
                        new_width = int(width * scale_factor)

                if should_resize:
                    resized_img = img.resize((new_width, new_height), Image.LANCZOS)
                    resized_img.save(output_path)
                else:
                    # Still save with a new unique name even if not resized
                    img.save(output_path)
        return True
    except Exception as e:
        print(f"An error occurred during image processing: {e}")
        return f"An error occurred: {e}"


class ImageResizerApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Image Resizer")
        self.root.geometry("500x100")  # Adjusted window size

        # --- UI Elements ---
        self.main_frame = tk.Frame(root, padx=10, pady=10)
        self.main_frame.pack(fill='both', expand=True)

        self.select_btn = tk.Button(self.main_frame, text="Select Folder and Start Processing", command=self.select_folder_and_process)
        self.select_btn.pack(pady=10)

        self.status_label = tk.Label(self.main_frame, text="Waiting for folder selection...", fg="gray")
        self.status_label.pack(pady=(0, 10), fill='x')

    def select_folder_and_process(self):
        folder_path = filedialog.askdirectory()
        if not folder_path:
            self.status_label.config(text="Operation cancelled. Select a folder to begin.", fg="gray")
            return

        self.status_label.config(text=f"Processing folder: {folder_path}", fg="blue")
        self.root.update_idletasks()

        output_folder = os.path.join(folder_path, "resized_images")

        # Disable button during processing
        self.select_btn.config(state='disabled', text="Processing...")
        self.root.update_idletasks()

        result = resize_images(folder_path, output_folder)

        # Re-enable button after processing
        self.select_btn.config(state='normal', text="Select Another Folder and Start")

        if result is True:
            self.status_label.config(text="Done. Select another folder to continue.", fg="green")
            self.show_completion_message("Processing Complete!")
        else:
            # Show error messages from resize_images function
            self.status_label.config(text="An error occurred. Please try again.", fg="red")
            messagebox.showerror("Error", result)

    def show_completion_message(self, message):
        """Displays a temporary, self-closing window with a message."""
        win = tk.Toplevel(self.root)
        win.transient(self.root)
        win.grab_set()
        win.geometry("250x70")
        win.title("Status")
        
        # Center the popup over the main window
        x = self.root.winfo_x() + (self.root.winfo_width() // 2) - (250 // 2)
        y = self.root.winfo_y() + (self.root.winfo_height() // 2) - (70 // 2)
        win.geometry(f"+{x}+{y}")

        tk.Label(win, text=message, pady=10).pack()
        
        # Automatically destroy the window after 2 seconds (2000 ms)
        win.after(2000, win.destroy)


if __name__ == "__main__":
    root = tk.Tk()
    app = ImageResizerApp(root)
    root.mainloop()
