# 🚀 Phat Hong - Personal Portfolio

<div align="center">

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-hpphat1992.vercel.app-blue?style=for-the-badge)](https://hpphat1992.vercel.app/)

[![Angular](https://img.shields.io/badge/Angular-19.2.0-red?style=flat-square&logo=angular)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Ant Design](https://img.shields.io/badge/Ant_Design-19.2.0-1890ff?style=flat-square&logo=antdesign)](https://ng.ant.design/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=flat-square&logo=vercel)](https://vercel.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**A modern, interactive personal portfolio and CV application showcasing professional experience, skills, and projects**

[🌐 Live Demo](https://hpphat1992.vercel.app/) • [📋 Features](#-features) • [🚀 Quick Start](#-quick-start) • [🛠️ Development](#️-development)

![Portfolio Preview](https://img.shields.io/badge/Built_with-❤️_and_Angular-red?style=for-the-badge)

</div>

---

## ✨ Features

<div align="center">

| 🎯 **Interactive CV** | 🌍 **Multilingual** | 📱 **Responsive** | 🎨 **Modern UI** |
|:---:|:---:|:---:|:---:|
| Dynamic CV viewer with smooth animations | English & Vietnamese support | Mobile-first responsive design | Clean, professional interface |

| 📊 **Skills Visualization** | 🖨️ **PDF Export** | 🌙 **Theme Toggle** | ⚡ **Performance** |
|:---:|:---:|:---:|:---:|
| Interactive skill charts & word clouds | Export CV to high-quality PDF | Dark/Light mode support | Optimized for fast loading |

</div>

### 🎯 Core Features
- **📋 Interactive CV Display** - Professional timeline with detailed experience
- **💼 Project Showcase** - Detailed portfolio with project descriptions and technologies
- **🎯 Skills Visualization** - Interactive charts and visual skill representations  
- **🌍 Internationalization** - Full support for English and Vietnamese
- **🖨️ PDF Export** - Generate and download professional CV as PDF
- **📱 Responsive Design** - Perfect display across all devices
- **🎨 Theme Support** - Dark and light mode with smooth transitions
- **⚡ Performance Optimized** - Fast loading with lazy loading and optimizations

---

## 🚀 Quick Start

### 📋 Prerequisites

Make sure you have the following installed:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (v9 or higher) - Comes with Node.js
- **Angular CLI** (v19.2.0) - Install globally: `npm install -g @angular/cli`

### 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/hbslovely/phat-hong-info.git
   cd phat-hong-info
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   # or
   ng serve --port 3001
   ```

4. **Open your browser**
   ```
   http://localhost:3001
   ```

🎉 **That's it!** Your local development server should now be running.

---

## 🛠️ Development

### 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server on port 3001 |
| `npm run build` | Build for production |
| `npm run build:prod` | Production build with optimizations |
| `npm run watch` | Build and watch for changes |
| `npm test` | Run unit tests |

### 🏗️ Project Structure

```
src/
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── contact-button/
│   │   ├── education-card/
│   │   ├── experience-card/
│   │   ├── export-pdf/
│   │   ├── language-switcher/
│   │   ├── project-detail/
│   │   ├── skill-detail/
│   │   └── theme-toggle/
│   ├── pages/               # Main application pages
│   │   ├── about/
│   │   ├── experience/
│   │   ├── projects/
│   │   ├── skills/
│   │   └── settings/
│   ├── services/            # Angular services
│   │   ├── cv.service.ts
│   │   ├── language.service.ts
│   │   ├── pdf.service.ts
│   │   └── theme.service.ts
│   └── models/              # TypeScript interfaces
├── assets/
│   ├── i18n/               # Translation files
│   ├── json/               # Data files
│   ├── images/             # Images and icons
│   └── fonts/              # Custom fonts
└── styles/                 # Global styles
```

### 🎨 Customization

#### Adding New Languages
1. Create translation files in `src/assets/i18n/`
2. Add corresponding data files in `src/assets/json/`
3. Update language service configuration

#### Modifying Content
- **Personal Info**: Edit `src/assets/json/personal-info.json`
- **Experience**: Update `src/assets/json/experience.json`
- **Projects**: Modify `src/assets/json/projects.json`
- **Skills**: Edit `src/assets/json/skills.json`

#### Styling
- Global styles: `src/styles.scss`
- Component styles: Individual `.scss` files
- Theme variables: Defined in theme service

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Fork this repository**
2. **Connect to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your forked repository
3. **Deploy automatically** - Vercel will build and deploy automatically

### Manual Deployment

```bash
# Build for production
npm run build:prod

# Deploy the dist/ folder to your hosting service
```

---

## 🛠️ Tech Stack

<div align="center">

| Frontend | UI Library | Internationalization | PDF Generation |
|:---:|:---:|:---:|:---:|
| ![Angular](https://img.shields.io/badge/Angular-red?logo=angular) | ![Ant Design](https://img.shields.io/badge/Ant_Design-1890ff?logo=antdesign) | ![ngx-translate](https://img.shields.io/badge/ngx--translate-green) | ![jsPDF](https://img.shields.io/badge/jsPDF-orange) |

| Visualization | Canvas | Fonts | Deployment |
|:---:|:---:|:---:|:---:|
| ![D3.js](https://img.shields.io/badge/D3.js-orange?logo=d3.js) | ![html2canvas](https://img.shields.io/badge/html2canvas-blue) | ![Custom Fonts](https://img.shields.io/badge/Source_Sans_Pro-purple) | ![Vercel](https://img.shields.io/badge/Vercel-black?logo=vercel) |

</div>

---

## 📸 Screenshots

<div align="center">

| Desktop View | Mobile View |
|:---:|:---:|
| ![Desktop](https://via.placeholder.com/400x300?text=Desktop+View) | ![Mobile](https://via.placeholder.com/200x300?text=Mobile+View) |

</div>

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### 🐛 Bug Reports

Found a bug? Please open an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Angular Team** - For the amazing framework
- **Ant Design** - For the beautiful UI components
- **Vercel** - For seamless deployment
- **Community** - For inspiration and feedback

---

<div align="center">

### 🌟 Show your support

Give a ⭐️ if this project helped you!

**[🌐 Visit Live Site](https://hpphat1992.vercel.app/)** • **[📧 Contact](mailto:your-email@example.com)** • **[💼 LinkedIn](https://linkedin.com/in/your-profile)**

---

**Made with ❤️ and Angular by Phat Hong**

</div>
