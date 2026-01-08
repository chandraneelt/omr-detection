#!/usr/bin/env python3
"""
OMR Scanner Setup Script
Automated setup for the OMR Scanner application
"""

import os
import sys
import subprocess
import platform
import json
from pathlib import Path

class OMRSetup:
    def __init__(self):
        self.root_dir = Path(__file__).parent
        self.backend_dir = self.root_dir / "backend"
        self.frontend_dir = self.root_dir / "frontend"
        self.system = platform.system().lower()
        
    def print_header(self, text):
        print(f"\n{'='*60}")
        print(f" {text}")
        print(f"{'='*60}")
        
    def print_step(self, step, text):
        print(f"\n[{step}] {text}")
        
    def run_command(self, command, cwd=None, shell=False):
        """Run a command and return success status"""
        try:
            if isinstance(command, str):
                command = command.split() if not shell else command
            
            result = subprocess.run(
                command, 
                cwd=cwd, 
                shell=shell,
                capture_output=True, 
                text=True
            )
            
            if result.returncode != 0:
                print(f"Error: {result.stderr}")
                return False
            return True
        except Exception as e:
            print(f"Error running command: {e}")
            return False
    
    def check_prerequisites(self):
        """Check if required software is installed"""
        self.print_header("Checking Prerequisites")
        
        # Check Python
        self.print_step(1, "Checking Python installation...")
        try:
            python_version = sys.version_info
            if python_version.major < 3 or python_version.minor < 8:
                print("❌ Python 3.8+ is required")
                return False
            print(f"✅ Python {python_version.major}.{python_version.minor}.{python_version.micro}")
        except Exception:
            print("❌ Python not found")
            return False
        
        # Check Node.js
        self.print_step(2, "Checking Node.js installation...")
        if not self.run_command(["node", "--version"]):
            print("❌ Node.js is required. Please install Node.js 16+")
            return False
        print("✅ Node.js found")
        
        # Check npm
        self.print_step(3, "Checking npm installation...")
        if not self.run_command(["npm", "--version"]):
            print("❌ npm is required")
            return False
        print("✅ npm found")
        
        return True
    
    def setup_backend(self):
        """Setup Python backend"""
        self.print_header("Setting Up Backend")
        
        # Create virtual environment
        self.print_step(1, "Creating Python virtual environment...")
        venv_path = self.backend_dir / "venv"
        
        if not venv_path.exists():
            if not self.run_command([sys.executable, "-m", "venv", "venv"], cwd=self.backend_dir):
                print("❌ Failed to create virtual environment")
                return False
        print("✅ Virtual environment created")
        
        # Determine pip path
        if self.system == "windows":
            pip_path = venv_path / "Scripts" / "pip"
            python_path = venv_path / "Scripts" / "python"
        else:
            pip_path = venv_path / "bin" / "pip"
            python_path = venv_path / "bin" / "python"
        
        # Install requirements
        self.print_step(2, "Installing Python dependencies...")
        if not self.run_command([str(pip_path), "install", "-r", "requirements.txt"], cwd=self.backend_dir):
            print("❌ Failed to install Python dependencies")
            return False
        print("✅ Python dependencies installed")
        
        # Test backend
        self.print_step(3, "Testing backend setup...")
        test_script = """
import cv2
import numpy as np
import flask
print("✅ All backend dependencies working")
"""
        
        try:
            result = subprocess.run([str(python_path), "-c", test_script], 
                                  cwd=self.backend_dir, capture_output=True, text=True)
            if result.returncode == 0:
                print(result.stdout.strip())
            else:
                print(f"❌ Backend test failed: {result.stderr}")
                return False
        except Exception as e:
            print(f"❌ Backend test failed: {e}")
            return False
        
        return True
    
    def setup_frontend(self):
        """Setup React frontend"""
        self.print_header("Setting Up Frontend")
        
        # Install npm dependencies
        self.print_step(1, "Installing Node.js dependencies...")
        if not self.run_command(["npm", "install"], cwd=self.frontend_dir):
            print("❌ Failed to install Node.js dependencies")
            return False
        print("✅ Node.js dependencies installed")
        
        # Create environment file
        self.print_step(2, "Creating environment configuration...")
        env_file = self.frontend_dir / ".env"
        env_content = "REACT_APP_API_URL=http://localhost:5000/api\n"
        
        try:
            with open(env_file, "w") as f:
                f.write(env_content)
            print("✅ Environment file created")
        except Exception as e:
            print(f"❌ Failed to create environment file: {e}")
            return False
        
        return True
    
    def setup_directories(self):
        """Create necessary directories"""
        self.print_header("Setting Up Directories")
        
        directories = [
            self.backend_dir / "uploads",
            self.backend_dir / "results",
            self.root_dir / "templates",
            self.root_dir / "samples"
        ]
        
        for i, directory in enumerate(directories, 1):
            self.print_step(i, f"Creating {directory.name}/ directory...")
            try:
                directory.mkdir(exist_ok=True)
                print(f"✅ {directory.name}/ directory ready")
            except Exception as e:
                print(f"❌ Failed to create {directory.name}/ directory: {e}")
                return False
        
        return True
    
    def create_sample_data(self):
        """Create sample OMR sheets and answer keys"""
        self.print_header("Creating Sample Data")
        
        # Create sample answer keys
        self.print_step(1, "Creating sample answer keys...")
        
        sample_answers = {
            "sample_20_answers.json": ["A", "B", "C", "D"] * 5,
            "sample_50_answers.json": ["A", "B", "C", "D", "E"] * 10
        }
        
        samples_dir = self.root_dir / "samples"
        
        for filename, answers in sample_answers.items():
            try:
                with open(samples_dir / filename, "w") as f:
                    json.dump(answers, f, indent=2)
                print(f"✅ Created {filename}")
            except Exception as e:
                print(f"❌ Failed to create {filename}: {e}")
                return False
        
        return True
    
    def create_startup_scripts(self):
        """Create startup scripts for easy launching"""
        self.print_header("Creating Startup Scripts")
        
        # Backend startup script
        if self.system == "windows":
            backend_script = self.root_dir / "start_backend.bat"
            backend_content = """@echo off
cd backend
call venv\\Scripts\\activate
python app.py
pause
"""
        else:
            backend_script = self.root_dir / "start_backend.sh"
            backend_content = """#!/bin/bash
cd backend
source venv/bin/activate
python app.py
"""
        
        # Frontend startup script
        if self.system == "windows":
            frontend_script = self.root_dir / "start_frontend.bat"
            frontend_content = """@echo off
cd frontend
npm start
pause
"""
        else:
            frontend_script = self.root_dir / "start_frontend.sh"
            frontend_content = """#!/bin/bash
cd frontend
npm start
"""
        
        scripts = [
            (backend_script, backend_content),
            (frontend_script, frontend_content)
        ]
        
        for i, (script_path, content) in enumerate(scripts, 1):
            self.print_step(i, f"Creating {script_path.name}...")
            try:
                with open(script_path, "w") as f:
                    f.write(content)
                
                # Make executable on Unix systems
                if self.system != "windows":
                    os.chmod(script_path, 0o755)
                
                print(f"✅ Created {script_path.name}")
            except Exception as e:
                print(f"❌ Failed to create {script_path.name}: {e}")
                return False
        
        return True
    
    def print_completion_message(self):
        """Print setup completion message with instructions"""
        self.print_header("Setup Complete!")
        
        print("\n🎉 OMR Scanner has been successfully set up!")
        print("\nTo start the application:")
        print("\n1. Start the backend server:")
        if self.system == "windows":
            print("   Double-click: start_backend.bat")
            print("   Or run: cd backend && venv\\Scripts\\activate && python app.py")
        else:
            print("   Run: ./start_backend.sh")
            print("   Or run: cd backend && source venv/bin/activate && python app.py")
        
        print("\n2. Start the frontend server (in a new terminal):")
        if self.system == "windows":
            print("   Double-click: start_frontend.bat")
            print("   Or run: cd frontend && npm start")
        else:
            print("   Run: ./start_frontend.sh")
            print("   Or run: cd frontend && npm start")
        
        print("\n3. Open your browser and go to: http://localhost:3000")
        
        print("\n📁 Sample files are available in the samples/ directory")
        print("📖 Documentation is available in the docs/ directory")
        print("⚙️  Templates can be customized in the templates/ directory")
        
        print("\nFor Docker deployment:")
        print("   docker-compose up --build")
        
        print("\n" + "="*60)
    
    def run_setup(self):
        """Run the complete setup process"""
        print("🚀 OMR Scanner Setup")
        print("This script will set up the OMR Scanner application")
        
        steps = [
            ("Prerequisites", self.check_prerequisites),
            ("Directories", self.setup_directories),
            ("Backend", self.setup_backend),
            ("Frontend", self.setup_frontend),
            ("Sample Data", self.create_sample_data),
            ("Startup Scripts", self.create_startup_scripts)
        ]
        
        for step_name, step_func in steps:
            if not step_func():
                print(f"\n❌ Setup failed at: {step_name}")
                print("Please check the error messages above and try again.")
                return False
        
        self.print_completion_message()
        return True

def main():
    setup = OMRSetup()
    success = setup.run_setup()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()