import tkinter as tk
from tkinter import filedialog, messagebox, ttk
import json
import os
import shutil
import zipfile

class ExtensionConverter:
	def __init__(self):
		self.window = tk.Tk()
		self.window.title("Chrome Extension to Firefox XPI Converter")
		self.window.geometry("500x400")
		self.window.configure(bg='#f0f0f0')

		# Initialize variables first
		self.selected_folder = None
		self.auto_id = tk.BooleanVar(value=True)
		self.extension_id = tk.StringVar()

		main_frame = tk.Frame(self.window, bg='#f0f0f0', padx=20, pady=20)
		main_frame.pack(expand=True, fill='both')

		title_label = tk.Label(main_frame, text="Chrome Extension to Firefox XPI Converter", font=("Arial", 14, "bold"), bg='#f0f0f0')
		title_label.pack(pady=(0, 20))

		# Create left frame for inputs and options
		left_frame = tk.Frame(main_frame, bg='#f0f0f0')
		left_frame.pack(fill=tk.BOTH, expand=True)

		self.select_btn = tk.Button(left_frame, text="Select Extension Folder", command=self.select_folder, font=("Arial", 10), bg='#4CAF50', fg='white', padx=20, pady=10)
		self.select_btn.pack(pady=10)

		self.path_label = tk.Label(left_frame, text="No folder selected", wraplength=400, bg='#f0f0f0')
		self.path_label.pack(pady=10)

		# Options
		options_frame = ttk.LabelFrame(left_frame, text="Options", padding=10)
		options_frame.pack(fill=tk.X, pady=10)

		ttk.Checkbutton(options_frame, text="Generate unique ID automatically",
		               variable=self.auto_id, command=self.toggle_id_input).pack(anchor=tk.W)

		self.id_frame = ttk.Frame(options_frame)
		self.id_frame.pack(fill=tk.X, pady=(10, 0))

		ttk.Label(self.id_frame, text="Extension ID:").pack(anchor=tk.W)
		ttk.Entry(self.id_frame, textvariable=self.extension_id).pack(fill=tk.X, pady=5)
		ttk.Label(self.id_frame, text="Example: your-extension@example.com",
		         font=("Helvetica", 8)).pack(anchor=tk.W)

		# Initially hide ID input if auto_id is True
		if self.auto_id.get():
			self.id_frame.pack_forget()

		self.convert_btn = tk.Button(left_frame, text="Convert to XPI", command=self.convert_extension, state='disabled', font=("Arial", 10), bg='#2196F3', fg='white', padx=20, pady=10)
		self.convert_btn.pack(pady=10)

		self.status_label = tk.Label(left_frame, text="", wraplength=400, bg='#f0f0f0')
		self.status_label.pack(pady=10)

	def toggle_id_input(self):
		"""Show/hide extension ID input based on checkbox"""
		if self.auto_id.get():
			self.id_frame.pack_forget()
		else:
			self.id_frame.pack(fill=tk.X, pady=(10, 0))

	def select_folder(self):
		folder = filedialog.askdirectory()
		if folder:
			self.selected_folder = folder
			self.path_label.config(text=f"Selected: {folder}")
			self.convert_btn.config(state='normal')
			self.status_label.config(text="")

	def convert_manifest(self, manifest_data, extension_name): # إضافة وسيط لاسم الإضافة
		manifest_v2 = manifest_data.copy()
		manifest_v2['manifest_version'] = 2

		# --- Action/Page Action Conversion (with details) ---
		action_details = {}
		if 'action' in manifest_v2:
			original_action = manifest_v2.pop('action')
			if isinstance(original_action, dict):
				action_details = {
					k: v for k, v in original_action.items()
					if k in ['default_popup', 'default_icon', 'default_title']
				}
			manifest_v2['browser_action'] = action_details # Use browser_action for MV3 action
		elif 'page_action' in manifest_v2:
			# If page_action exists, ensure its details are preserved
			original_page_action = manifest_v2['page_action']
			if isinstance(original_page_action, dict):
				action_details = {
					k: v for k, v in original_page_action.items()
					if k in ['default_popup', 'default_icon', 'default_title']
				}
			manifest_v2['page_action'] = action_details # Keep page_action

		# --- Icon Handling ---
		if 'icons' in manifest_v2:
			original_icons = manifest_v2.pop('icons') # Remove top-level icons key
			if isinstance(original_icons, dict):
				# If browser_action exists, try to add icons there
				if 'browser_action' in manifest_v2 and isinstance(manifest_v2['browser_action'], dict):
					if 'default_icon' not in manifest_v2['browser_action']:
						manifest_v2['browser_action']['default_icon'] = original_icons
				# Else if page_action exists, try to add icons there
				elif 'page_action' in manifest_v2 and isinstance(manifest_v2['page_action'], dict):
					if 'default_icon' not in manifest_v2['page_action']:
						manifest_v2['page_action']['default_icon'] = original_icons
				# Else (no action key), put it back at the top level (Firefox might still use it)
				else:
					manifest_v2['icons'] = original_icons
		# --- End Icon Handling ---


		# --- Background Script Conversion ---
		if 'background' in manifest_v2:
			bg = manifest_v2['background']
			final_scripts = []
			if 'service_worker' in bg and isinstance(bg.get('service_worker'), str):
				# Use service worker script if defined
				final_scripts.append(bg['service_worker'])
			elif 'scripts' in bg and isinstance(bg.get('scripts'), list):
				# Use existing scripts if defined
				final_scripts.extend(s for s in bg['scripts'] if isinstance(s, str))

			if final_scripts:
				# Set the background scripts for Firefox
				manifest_v2['background'] = {'scripts': final_scripts}
				# Firefox doesn't use 'persistent', remove if present
				if 'persistent' in manifest_v2['background']:
					del manifest_v2['background']['persistent']
			else:
				# If no valid scripts found, remove the background key entirely
				del manifest_v2['background']
		# --- End Background Script Conversion ---

		if 'host_permissions' in manifest_v2:
			if 'permissions' not in manifest_v2:
				manifest_v2['permissions'] = []
			manifest_v2['permissions'].extend(manifest_v2.pop('host_permissions'))

		# Convert web_accessible_resources (Chrome V3 format) to Firefox format (flat array of strings)
		if 'web_accessible_resources' in manifest_v2:
			chrome_war = manifest_v2['web_accessible_resources']
			firefox_war = []
			if isinstance(chrome_war, list):
				for entry in chrome_war:
					if isinstance(entry, dict) and 'resources' in entry and isinstance(entry['resources'], list):
						# Extract file paths/patterns from the 'resources' array
						firefox_war.extend([res for res in entry['resources'] if isinstance(res, str)])
					elif isinstance(entry, str):
						# Handle cases where it might already contain strings (less common in V3)
						firefox_war.append(entry)
			# Remove duplicates and assign the flat list
			manifest_v2['web_accessible_resources'] = list(set(firefox_war))

		# --- Content Security Policy Conversion ---
		if 'content_security_policy' in manifest_v2:
			csp_v3 = manifest_v2['content_security_policy']
			if isinstance(csp_v3, dict) and 'extension_pages' in csp_v3 and isinstance(csp_v3['extension_pages'], str):
				# Extract the policy string for Firefox
				manifest_v2['content_security_policy'] = csp_v3['extension_pages']
			elif not isinstance(csp_v3, str):
				# If it's not a dict with extension_pages or already a string, remove it to be safe
				# Or set a default permissive one if needed, but removing is safer
				del manifest_v2['content_security_policy']
		# --- End CSP Conversion ---

		# --- Generate Truly Unique ID ---
		# Create a unique ID based on the folder name and content hash
		import hashlib
		import uuid
		import time

		# 1. Lowercase and replace spaces with hyphens
		sanitized_name = extension_name.lower().replace(' ', '-')
		# 2. Keep only alphanumeric characters and hyphens
		sanitized_name = ''.join(c for c in sanitized_name if c.isalnum() or c == '-')
		# 3. Ensure it's not empty
		if not sanitized_name:
			sanitized_name = 'generic-extension'

		# 4. Generate a unique hash based on extension name, timestamp, and a random UUID
		unique_string = f"{sanitized_name}-{time.time()}-{uuid.uuid4()}"
		hash_object = hashlib.md5(unique_string.encode())
		unique_hash = hash_object.hexdigest()[:8]  # Use first 8 chars of hash for brevity

		# 5. Create the final ID with both name and hash for uniqueness or use custom ID
		if self.auto_id.get():
			# Generate automatic ID
			extension_id = f"{sanitized_name}-{unique_hash}@example.org"
		else:
			# Use custom ID if provided, otherwise fall back to generated ID
			custom_id = self.extension_id.get().strip()
			if custom_id:
				extension_id = custom_id
			else:
				extension_id = f"{sanitized_name}-{unique_hash}@example.org"
				print("Warning: Custom ID was empty, using generated ID instead")

		# Use browser_specific_settings (Firefox preferred key)
		manifest_v2['browser_specific_settings'] = {
			'gecko': {
				'id': extension_id, # Use the ID (either custom or dynamic)
				'strict_min_version': '42.0'
			}
		}
		# --- Ensure Gecko ID is always present ---
		# Note: Using setdefault on the nested structure directly
		gecko_settings = manifest_v2.setdefault('browser_specific_settings', {}).setdefault('gecko', {})
		if 'id' not in gecko_settings or not gecko_settings['id']:
			gecko_settings['id'] = extension_id # Use the ID (either custom or dynamic)
		if 'strict_min_version' not in gecko_settings or not gecko_settings['strict_min_version']:
			gecko_settings['strict_min_version'] = '42.0'
		# --- End Ensure Gecko ID ---


		if 'content_scripts' in manifest_v2:
			for script in manifest_v2['content_scripts']:
				if 'matches' in script and '<all_urls>' in script['matches']:
					script['matches'] = ['*://*/*']

		# --- Stricter Permission Filtering ---
		if 'permissions' in manifest_v2:
			# Keep only a core set of known cross-browser permissions
			# IMPORTANT: Removing host permissions ('*://*/*', 'http://*/*', 'https://*/*') for now
			core_permissions = {
				'activeTab', 'alarms', 'bookmarks', 'browsingData', 'clipboardRead',
				'clipboardWrite', 'contextMenus', 'cookies', 'debugger', 'declarativeNetRequest',
				'declarativeNetRequestFeedback', 'downloads', 'downloads.open', 'find', 'geolocation',
				'history', 'identity', 'idle', 'management', 'nativeMessaging', 'notifications',
				'pageCapture', 'privacy', 'proxy', 'scripting', 'search', 'sessions', 'storage',
				'system.cpu', 'system.display', 'system.memory', 'system.storage', 'tabGroups',
				'tabHide', 'tabs', 'topSites', 'unlimitedStorage', 'webNavigation', 'webRequest',
				'webRequestBlocking'
				# Note: Host permissions like '*://*/*' are deliberately excluded for this test
			}
			original_permissions = manifest_v2.get('permissions', [])
			filtered_permissions = [p for p in original_permissions if p in core_permissions]

			if filtered_permissions:
				manifest_v2['permissions'] = filtered_permissions
			else:
				# If no supported permissions remain, set an empty list
				manifest_v2['permissions'] = []
		# --- End Stricter Permission Filtering ---

		# --- Remove known Chrome-specific top-level keys ---
		chrome_only_keys = ['key', 'update_url', 'minimum_chrome_version', 'offline_enabled', 'differential_fingerprint']
		for key in chrome_only_keys:
			if key in manifest_v2:
				del manifest_v2[key]
		# --- End Remove Chrome Keys ---

		# --- Add default_locale if _locales exists ---
		locales_path = os.path.join(self.selected_folder, '_locales') if self.selected_folder else None
		if locales_path and os.path.isdir(locales_path):
			# Check if any subdirectories exist (representing languages)
			if any(os.path.isdir(os.path.join(locales_path, lang)) for lang in os.listdir(locales_path)):
				manifest_v2.setdefault('default_locale', 'en') # Add default_locale if not present
		# --- End Add default_locale ---


		return manifest_v2

	def convert_extension(self):
		try:
			if not self.selected_folder:
				messagebox.showerror("Error", "Please select a folder first")
				return

			self.status_label.config(text="Converting...")
			self.window.update()

			manifest_path = os.path.join(self.selected_folder, 'manifest.json')
			if not os.path.exists(manifest_path):
				raise Exception("manifest.json not found")

			with open(manifest_path, 'r', encoding='utf-8') as f:
				manifest_data = json.load(f)

			# الحصول على اسم المجلد وتمريره
			extension_name = os.path.basename(self.selected_folder.rstrip("/\\\\"))
			manifest_v2 = self.convert_manifest(manifest_data, extension_name)

			temp_dir = os.path.join(self.selected_folder, 'temp_firefox')
			if os.path.exists(temp_dir):
				shutil.rmtree(temp_dir)
			os.makedirs(temp_dir)

			for item in os.listdir(self.selected_folder):
				if item not in ['manifest.json', 'temp_firefox', 'extension.xpi', '.git']:
					src = os.path.join(self.selected_folder, item)
					dst = os.path.join(temp_dir, item)
					if os.path.isdir(src):
						shutil.copytree(src, dst)
					else:
						shutil.copy2(src, dst)

			# --- Debug: Show final manifest before zipping ---
			try:
				final_manifest_str = json.dumps(manifest_v2, indent=2)
				print("--- Final Manifest ---") # For console debugging
				print(final_manifest_str)
				print("----------------------")
				# Display part of it in the status label for GUI feedback
				gecko_id = manifest_v2.get('browser_specific_settings',{}).get('gecko',{}).get('id','N/A') # Check browser_specific_settings
				id_type = "Custom" if not self.auto_id.get() and self.extension_id.get().strip() else "Generated"
				self.status_label.config(text=f"Manifest OK ({id_type} ID: {gecko_id}). Zipping...")
				self.window.update() # Force GUI update
			except Exception as debug_e:
				print(f"Error generating debug manifest string: {debug_e}")
				self.status_label.config(text="Manifest generated (check console). Zipping...")
				self.window.update()
			# --- End Debug ---

			# Write the final manifest
			temp_manifest_path = os.path.join(temp_dir, 'manifest.json')
			with open(temp_manifest_path, 'w', encoding='utf-8') as f:
				json.dump(manifest_v2, f, indent=2)

			# Create the XPI file
			xpi_path = os.path.join(self.selected_folder, 'extension.xpi')
			with zipfile.ZipFile(xpi_path, 'w', zipfile.ZIP_DEFLATED) as zf:
				# Define items to ignore (تجاهل ملفات ومجلدات .git عند الضغط)
				ignore_names = ['.git', '__pycache__', '.DS_Store'] # Add more if needed

				for root, dirs, files in os.walk(temp_dir):
					# Modify dirs in-place to prevent os.walk from entering ignored directories
					dirs[:] = [d for d in dirs if d not in ignore_names]
					for file in files:
						full_path = os.path.join(root, file)
						arcname = os.path.relpath(full_path, temp_dir)
						zf.write(full_path, arcname)

			# No need to zip the original folder, only the XPI is needed.
			# zip_name = os.path.basename(self.selected_folder.rstrip("/\'))
			# zip_output_path = os.path.join(self.selected_folder, f"{zip_name}.zip")
			# with zipfile.ZipFile(zip_output_path, 'w', zipfile.ZIP_DEFLATED) as zf:
			# 	for root, _, files in os.walk(self.selected_folder):
			# 			for file in files:
			# 				if file != os.path.basename(zip_output_path):
			# 						full_path = os.path.join(root, file)
			# 							arcname = os.path.relpath(full_path, self.selected_folder)
			# 							zf.write(full_path, arcname)

			shutil.rmtree(temp_dir)

			self.status_label.config(text="Conversion complete!")
			messagebox.showinfo("Success", f"Extension converted successfully.\nInstall the file: {xpi_path}")

		except Exception as e:
			self.status_label.config(text="Error occurred!")
			messagebox.showerror("Error", str(e))

	def run(self):
		self.window.mainloop()

if __name__ == "__main__":
	app = ExtensionConverter()
	app.run()