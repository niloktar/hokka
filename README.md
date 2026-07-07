# Hokka 🖋️

A sleek, premium, and cozy rich text editor designed for a clean, distraction-free writing experience. Inspired by traditional word processors and modern document editors, Hokka features a beautiful Google Docs-like paper layout with an integrated ruler, cozy visual themes, and local asset support.

---

## ✨ Features

- **📄 Document Paper View**: Google Docs-style central editor paper container with realistic page padding, margins, card shadow, and a physical tick-mark ruler (calculating real-time cm ticks).
- **🎨 Cozy & Minimalist Themes**: Choose between 4 carefully curated visual themes (Peach Dream, Oatmeal & Coffee, Matcha Latte, Lavender Night) to match your writing mood.
- **✨ Custom Premium Dropdowns**: Native select tags are completely replaced with clean, theme-aware custom dropdown elements with smooth micro-animations.
- **🌈 Text Color & Highlight Palette**: Detailed color panel categorizing Standard, Pastel, and Vivid colors, including an advanced Custom Color option that triggers the native OS color wheel.
- **⚙️ Advanced Typography**: Line spacing controls (`1.0`, `1.15`, `1.5`, `1.8`, `2.0`), font family selectors, font size modifiers, and text block formatting (Paragraph, Heading 1, Heading 2, Heading 3, Blockquote).
- **🖼️ Local Asset Uploads**: Insert links, horizontal rules, pre-built table grids, and upload images **directly from your computer** (storing assets as Base64 data URIs) or load them via web URLs.
- **🔍 Find & Replace**: A collapsable drawer directly below the toolbar to search for text patterns, find next, and replace occurrences dynamically.
- **🖨️ PDF & Print Layout**: A custom `@media print` style sheet triggers clean document layouts. Print or export to PDF hiding toolbars, footers, sidebars, and theme colors.
- **📂 Auto-Save (LocalStorage)**: Documents, active titles, and formatting changes are saved automatically so you never lose your progress.
- **📊 Real-time Statistics**: Live footer tracking character count, word count, and estimated reading time.

---

## 🚀 Getting Started

### 📋 Prerequisites

Ensure you have **Node.js** (version 18 or higher) and **npm** installed on your system.

### 🔧 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/niloktar/hokka.git
   cd hokka
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

### 💻 Running Locally

To start the local development server:
```bash
npm run dev
```
Open the local URL displayed in your terminal (typically `http://localhost:5173`) in your browser.

### 📦 Building for Production

To compile and bundle the application for production deployment:
```bash
npm run build
```
The output bundle will be generated inside the `dist` directory.

### 🔍 Linting

To check the codebase for syntax or formatting issues:
```bash
npm run lint
```

---

## 🛠️ Tech Stack

- **Core**: React 18, Vite
- **Styling**: Tailwind CSS v4, Vanilla CSS
- **State & Collaboration**: Yjs (Y-Textarea, Y-Websocket) for collaborative text capabilities

---

## 🇹🇷 Kurulum ve Çalıştırma (Turkish Summary)

### 1. Bağımlılıkları Yükleyin:
```bash
npm install
```

### 2. Geliştirici Sunucusunu Başlatın:
```bash
npm run dev
```

### 3. Canlı Sürüm Derleme (Build):
```bash
npm run build
```
