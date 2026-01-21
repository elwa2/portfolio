import tkinter as tk
from tkinter import filedialog, messagebox, ttk
from PIL import Image, ImageTk, ImageEnhance, ImageOps
import os

class ImageEditor:
    def __init__(self, master):
        self.master = master
        master.title("Image Editor Pro")

        self.image_path = None
        self.original_image = None
        self.edited_image = None
        self.tk_image = None
        self.image_list = []
        self.image_index = 0
        self.folder_path = None

        self.output_size_var = tk.StringVar(value="1500x1500")
        self.custom_size_width_var = tk.StringVar(value="1500")
        self.custom_size_height_var = tk.StringVar(value="1500")

        # UI elements
        self.select_folder_button = tk.Button(master, text="Select Folder", command=self.select_folder)
        self.select_folder_button.grid(row=0, column=0, columnspan=3, padx=10, pady=10, sticky="ew")

        self.image_label = tk.Label(master)
        self.image_label.grid(row=1, column=0, padx=10, pady=10, sticky="nsew", columnspan=3)

        # Navigation Buttons Frame
        self.nav_frame = tk.Frame(master)
        self.nav_frame.grid(row=2, column=0, columnspan=3, padx=10, pady=5, sticky="ew")

        self.prev_button = tk.Button(self.nav_frame, text="Previous Image", command=self.prev_image, state=tk.DISABLED)
        self.prev_button.grid(row=0, column=0, padx=5, pady=5, sticky="w")

        self.next_button = tk.Button(self.nav_frame, text="Next Image", command=self.next_image, state=tk.DISABLED)
        self.next_button.grid(row=0, column=1, padx=5, pady=5, sticky="e")

        # Settings frame
        self.settings_frame = tk.Frame(master, borderwidth=2, relief="groove", padx=10, pady=10)
        self.settings_frame.grid(row=1, column=3, padx=10, pady=10, sticky="ns")

        settings_row = 0

        # Output Size Frame

        # Custom Size Frame (initially hidden)
        self.custom_size_frame = tk.Frame(self.settings_frame)
        self.custom_size_frame.grid(row=settings_row, column=0, columnspan=2, sticky="ew")
        self.custom_size_frame.grid_remove()
        settings_row += 1

        self.custom_width_label = tk.Label(self.custom_size_frame, text="Width:")
        self.custom_width_label.grid(row=0, column=0, sticky="w")
        self.custom_width_entry = tk.Entry(self.custom_size_frame, textvariable=self.custom_size_width_var)
        self.custom_width_entry.grid(row=0, column=1, sticky="ew", padx=5)

        self.custom_height_label = tk.Label(self.custom_size_frame, text="Height:")
        self.custom_height_label.grid(row=1, column=0, sticky="w")
        self.custom_height_entry = tk.Entry(self.custom_size_frame, textvariable=self.custom_size_height_var)
        self.custom_height_entry.grid(row=1, column=1, sticky="ew", padx=5)

        # Brightness
        self.brightness_label = tk.Label(self.settings_frame, text="Brightness")
        self.brightness_label.grid(row=settings_row, column=0, sticky="w")
        self.brightness_scale = tk.Scale(self.settings_frame, from_=0.1, to=2.0, resolution=0.1, orient=tk.HORIZONTAL, command=self.adjust_brightness)
        self.brightness_scale.set(1.0)
        self.brightness_scale.grid(row=settings_row, column=1, sticky="ew")
        settings_row += 1

        # Contrast
        self.contrast_label = tk.Label(self.settings_frame, text="Contrast")
        self.contrast_label.grid(row=settings_row, column=0, sticky="w")
        self.contrast_scale = tk.Scale(self.settings_frame, from_=0.1, to=2.0, resolution=0.1, orient=tk.HORIZONTAL, command=self.adjust_contrast)
        self.contrast_scale.set(1.0)
        self.contrast_scale.grid(row=settings_row, column=1, sticky="ew")
        settings_row += 1

        # Sharpness
        self.sharpness_label = tk.Label(self.settings_frame, text="Sharpness")
        self.sharpness_label.grid(row=settings_row, column=0, sticky="w")
        self.sharpness_scale = tk.Scale(self.settings_frame, from_=0.1, to=2.0, resolution=0.1, orient=tk.HORIZONTAL, command=self.adjust_sharpness)
        self.sharpness_scale.set(1.0)
        self.sharpness_scale.grid(row=settings_row, column=1, sticky="ew")
        settings_row += 1

        # Saturation
        self.saturation_label = tk.Label(self.settings_frame, text="Saturation")
        self.saturation_label.grid(row=settings_row, column=0, sticky="w")
        self.saturation_scale = tk.Scale(self.settings_frame, from_=0.0, to=2.0, resolution=0.1, orient=tk.HORIZONTAL, command=self.adjust_color)
        self.saturation_scale.set(1.0)
        self.saturation_scale.grid(row=settings_row, column=1, sticky="ew")
        settings_row += 1

        # Hue
        self.hue_label = tk.Label(self.settings_frame, text="Hue")
        self.hue_label.grid(row=settings_row, column=0, sticky="w")
        self.hue_scale = tk.Scale(self.settings_frame, from_=-180, to=180, resolution=1, orient=tk.HORIZONTAL, command=self.adjust_hue)
        self.hue_scale.set(0)
        self.hue_scale.grid(row=settings_row, column=1, sticky="ew")
        settings_row += 1

        # Levels
        self.levels_button = tk.Button(self.settings_frame, text="Auto Levels", command=self.adjust_levels)
        self.levels_button.grid(row=settings_row, column=0, columnspan=2, sticky="ew")
        settings_row += 1

        # Curves - Button Placeholder
        self.curves_button = tk.Button(self.settings_frame, text="Curves (Coming Soon)", command=self.adjust_curves_placeholder) # Button for Curves placeholder
        self.curves_button.grid(row=settings_row, column=0, columnspan=2, sticky="ew")
        settings_row += 1


        self.apply_all_button = tk.Button(master, text="Apply to All", command=self.apply_to_all)
        self.apply_all_button.grid(row=2, column=3, padx=10, pady=10, sticky="ew")

        # Configure settings frame expandable column
        self.settings_frame.grid_columnconfigure(1, weight=1)

        # Configure master grid layout
        master.grid_columnconfigure(0, weight=1)
        master.grid_columnconfigure(1, weight=1)
        master.grid_columnconfigure(2, weight=1)
        master.grid_columnconfigure(3, weight=0)
        master.grid_rowconfigure(1, weight=1)

    def update_custom_size_visibility(self, event=None):
        if self.output_size_var.get() == "Custom":
            self.custom_size_frame.grid()
        else:
            self.custom_size_frame.grid_remove()

    def select_folder(self):
        self.folder_path = filedialog.askdirectory(title="Select Image Folder")
        if self.folder_path:
            self.image_list = [f for f in os.listdir(self.folder_path) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
            if self.image_list:
                self.image_index = 0
                self.load_image()
                self.update_nav_buttons()

    def load_image(self):
        if not self.image_list:
            return

        try:
            self.image_path = os.path.join(self.folder_path, self.image_list[self.image_index])
            self.original_image = Image.open(self.image_path)
            self.edited_image = self.original_image.copy()
            self.adjust_image()
        except Exception as e:
            messagebox.showerror("Error Loading Image", f"Could not load image: {self.image_list[self.image_index]}. Error: {e}")
            self.image_list.pop(self.image_index)
            if not self.image_list:
                self.clear_image_display()
                self.update_nav_buttons()
                return
            self.image_index = min(self.image_index, len(self.image_list) - 1)
            self.load_image()
            return

    def adjust_image(self):
        if self.edited_image:
            image = self.edited_image.copy()

            enhancer_brightness = ImageEnhance.Brightness(image)
            image = enhancer_brightness.enhance(self.brightness_scale.get())
            enhancer_contrast = ImageEnhance.Contrast(image)
            image = enhancer_contrast.enhance(self.contrast_scale.get())
            enhancer_sharpness = ImageEnhance.Sharpness(image)
            image = enhancer_sharpness.enhance(self.sharpness_scale.get())
            enhancer_color = ImageEnhance.Color(image)
            image = enhancer_color.enhance(self.saturation_scale.get())
            image = image.convert("HSV")
            h, s, v = image.split()
            h = h.point(lambda i: (i + self.hue_scale.get()) % 256)
            image = Image.merge("HSV", (h, s, v)).convert("RGB")
            image = ImageOps.autocontrast(image) # Levels Adjustment - remains

            # Curves Adjustment - No implementation in this version - Placeholder


            max_width = self.master.winfo_screenwidth() // 2
            max_height = self.master.winfo_screenheight() - 200
            image.thumbnail((max_width, max_height))
            self.tk_image = ImageTk.PhotoImage(image)
            self.image_label.config(image=self.tk_image)
            self.image_label.image = self.tk_image
        else:
            self.load_image()

    def clear_image_display(self):
        self.image_label.config(image=None)
        self.tk_image = None

    def adjust_brightness(self, value):
        if self.original_image:
            self.edited_image = self.original_image.copy()
            self.adjust_image()

    def adjust_contrast(self, value):
        if self.original_image:
            self.edited_image = self.original_image.copy()
            self.adjust_image()

    def adjust_sharpness(self, value):
        if self.original_image:
            self.edited_image = self.original_image.copy()
            self.adjust_image()

    def adjust_color(self, value): # Saturation
        if self.original_image:
            self.edited_image = self.original_image.copy()
            self.adjust_image()

    def adjust_hue(self, value):
        if self.original_image:
            self.edited_image = self.original_image.copy()
            self.adjust_image()

    def adjust_levels(self):
        if self.original_image:
            self.edited_image = self.original_image.copy()
            self.edited_image = ImageOps.autocontrast(self.edited_image)
            self.adjust_image()

    # Curves Adjustment - Placeholder function
    def adjust_curves_placeholder(self):
        messagebox.showinfo("Curves Feature", "Interactive Curves UI is coming soon in a future version!")


    def next_image(self):
        if self.image_list:
            self.image_index = (self.image_index + 1) % len(self.image_list)
            self.load_image()
            self.update_nav_buttons()

    def prev_image(self):
        if self.image_list:
            self.image_index = (self.image_index - 1) % len(self.image_list)
            self.load_image()
            self.update_nav_buttons()

    def update_nav_buttons(self):
        if not self.image_list:
            self.next_button.config(state=tk.DISABLED)
            self.prev_button.config(state=tk.DISABLED)
            return

        self.next_button.config(state=tk.NORMAL)
        self.prev_button.config(state=tk.NORMAL)

        if self.image_index == 0:
            self.prev_button.config(state=tk.DISABLED)
        if self.image_index == len(self.image_list) - 1:
            self.next_button.config(state=tk.DISABLED)

    def apply_to_all(self):
        if not self.folder_path:
            messagebox.showerror("Error", "Please select a folder first.")
            return

        output_folder = os.path.join(self.folder_path, "processed_images")
        if not os.path.exists(output_folder):
            try:
                os.makedirs(output_folder)
            except OSError as e:
                messagebox.showerror("Error", f"Could not create output folder: {e}")
                return

        brightness = self.brightness_scale.get()
        contrast = self.contrast_scale.get()
        sharpness = self.sharpness_scale.get()
        saturation = self.saturation_scale.get()
        hue = self.hue_scale.get()

        output_size_option = self.output_size_var.get()
        if output_size_option == "1500x1500":
            size = (1500, 1500)
        elif output_size_option == "Custom":
            try:
                width = int(self.custom_size_width_var.get())
                height = int(self.custom_size_height_var.get())
                if width <= 0 or height <= 0:
                    raise ValueError("Width and Height must be positive integers")
                size = (width, height)
            except ValueError:
                messagebox.showerror("Error", "Invalid custom size. Please enter positive integer values for width and height.")
                return
        else: # Original size
            size = None

        for filename in self.image_list:
            if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
                try:
                    img_path = os.path.join(self.folder_path, filename)
                    img = Image.open(img_path)

                    if size:
                        img = ImageOps.fit(img, size, Image.Resampling.LANCZOS)
                        img = img.convert("RGBA")
                        background = Image.new("RGBA", img.size, "white")
                        background.paste(img, img)
                        img = background.convert("RGB")
                    else:
                        img = img.convert("RGBA")
                        background = Image.new("RGBA", img.size, "white")
                        background.paste(img, img)
                        img = background.convert("RGB")

                    enhancer_brightness = ImageEnhance.Brightness(img)
                    img = enhancer_brightness.enhance(brightness)
                    enhancer_contrast = ImageEnhance.Contrast(img)
                    img = enhancer_contrast.enhance(contrast)
                    enhancer_sharpness = ImageEnhance.Sharpness(img)
                    img = enhancer_sharpness.enhance(sharpness)
                    enhancer_color = ImageEnhance.Color(img)
                    img = enhancer_color.enhance(saturation)
                    img = img.convert("HSV")
                    h, s, v = img.split()
                    h = h.point(lambda i: (i + hue) % 256)
                    img = Image.merge("HSV", (h, s, v)).convert("RGB")
                    img = ImageOps.autocontrast(img) # Levels Adjustment - remains
                    # Curves Adjustment - No implementation in this version - Placeholder


                    output_path = os.path.join(output_folder, filename)
                    img.save(output_path)

                except Exception as e:
                    messagebox.showerror("Error processing image", f"Error processing {filename}: {e}")

        messagebox.showinfo("Success", "Images processed and saved to 'processed_images' folder!")


root = tk.Tk()
editor = ImageEditor(root)
root.mainloop()