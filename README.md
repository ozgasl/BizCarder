📇 BizCarder - Smart Business Card DesignerBizCarder is an interactive, multi-language (TR/EN) desktop and web application designed to help you create professional, elegant business cards with smart vCard QR codes and live PDF printing capabilities.🌟 Key Features🌐 Dual Language Support: Switch seamlessly between Turkish (TR) and English (EN) interfaces in real-time.📱 Smart QR Code (vCard): Encodes all contact info dynamically. Scan the QR code on the back with any smartphone to instantly save contacts.🎨 Creative Templates: Modern, Minimal, Corporate, and Dark & Elegant template designs.🖼️ Custom Brand Logos: Support for file uploads (PNG, JPG) with transparency or vector presets.📐 Print & PDF Ready: Configured to export perfect standard 3.5" x 2" layouts directly via Chrome/Electron print features.💻 Running the Desktop App (Electron)This project can be packaged as a cross-platform desktop application (.exe, .dmg, .appImage) using Node.js and Electron.PrerequisitesMake sure you have Node.js installed.1. Place the FilesEnsure your project directory (BizCarder) contains the following files in the same level:index.htmlmain.jspackage.jsonREADME.md2. Install DependenciesOpen your command terminal inside the project directory and run:npm install
3. Run in Development ModeLaunch the BizCarder desktop client application:npm start
4. Package for OS (Windows, macOS, Linux)Compile the application into installers:npm run package
Installers will be generated under the /dist folder.🚀 Pushing to GitHub (BizCarder Repository)Open your terminal in the BizCarder folder and run these Git commands:# Initialize a Git repository
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial release: BizCarder with Electron & bilingual TR/EN support"

# Create a main branch
git branch -M main

# Link to your new repository
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/BizCarder.git

# Push to your remote repository
git push -u origin main
🛠️ Tech StackUI Framework: Tailwind CSS, FontAwesome IconsQR Engine: Kazuhiko Arase (qrcode-generator)Runtime: Node.js, Electron (v28)License: MIT