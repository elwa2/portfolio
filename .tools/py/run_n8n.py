import subprocess
import sys
import os
import webbrowser
import time

def run_command(command, capture_output=False):
    """Runs a command in the shell."""
    try:
        # Using shell=True because npm commands might be .cmd files on Windows
        # and this handles path resolution correctly.
        process = subprocess.run(
            command, 
            shell=True, 
            check=True, 
            capture_output=capture_output, 
            text=True,
            # Hide console window for subprocesses on Windows
            creationflags=subprocess.CREATE_NO_WINDOW if sys.platform == 'win32' else 0
        )
        return process
    except subprocess.CalledProcessError as e:
        print(f"Error executing command: {' '.join(command) if isinstance(command, list) else command}")
        print(f"Return code: {e.returncode}")
        if e.stdout:
            print(f"Output: {e.stdout}")
        if e.stderr:
            print(f"Error output: {e.stderr}")
        return None
    except FileNotFoundError:
        print(f"Command not found: {command.split()[0]}. Please ensure it's in your PATH.")
        return None

def main():
    """
    Checks for n8n installation, installs or updates it if necessary,
    and then starts the n8n server.
    """
    print("Checking for n8n installation...")

    # Check if n8n is installed by trying to list it.
    # A non-zero exit code means it's not installed.
    is_installed = subprocess.run(
        "npm list -g n8n", 
        shell=True, 
        stdout=subprocess.PIPE, 
        stderr=subprocess.PIPE
    ).returncode == 0

    if not is_installed:
        print("n8n is not installed. Installing now...")
        if run_command("npm install -g n8n@next"):
            print("n8n installed successfully.")
        else:
            print("Failed to install n8n. Please check your npm and network settings.")
            sys.exit(1)
    else:
        print("n8n is already installed. Checking for updates...")
        # `npm outdated -g n8n` will have output if an update is available.
        result = run_command("npm outdated -g n8n", capture_output=True)
        if result and result.stdout:
            print("A new version of n8n is available. Updating...")
            if run_command("npm install -g n8n@next"):
                print("n8n updated successfully.")
            else:
                print("Failed to update n8n.")
        else:
            print("n8n is up to date.")

    print("\nStarting n8n...")
    print("You can stop the server by pressing Ctrl+C in the terminal.")
    
    # Start n8n in a new process.
    try:
        # On Windows, the command might be `n8n.cmd`
        command_to_run = "n8n"
        # Use Popen to run n8n in the background
        n8n_process = subprocess.Popen(command_to_run, shell=True)

        # Give the server a moment to start up
        print("Waiting for n8n server to initialize (10 seconds)...")
        time.sleep(10)

        # Open the web browser
        print("Opening n8n in your web browser at http://localhost:5678/")
        webbrowser.open("http://localhost:5678/")

        # Wait for the process to complete (e.g., user closes the terminal)
        n8n_process.wait()

    except KeyboardInterrupt:
        print("\nStopping n8n server...")
        n8n_process.terminate()
        n8n_process.wait() # Wait for the process to terminate
        print("n8n server stopped by user.")
    except Exception as e:
        print(f"An error occurred while trying to start n8n: {e}")
        print("Please ensure Node.js is installed and the global npm modules path is in your system's PATH.")

if __name__ == "__main__":
    main()
