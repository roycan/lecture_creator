# Barangay Management System

> A simple web application for managing barangay resident information and services

## 📝 About

This project helps barangay officials keep track of:
- Resident information (names, addresses, contact details)
- Clearance requests and issuance
- Announcements and notices
- Official contact information

Built as a learning project for Grade 9 Computer Science to understand web development, databases, and community service applications.

## ✨ Features

- ✅ **Resident Directory** - Search and view resident information
- ✅ **Clearance System** - Request and track barangay clearances
- ✅ **Announcements Board** - Post and view community announcements
- ✅ **Officials Directory** - Contact information for barangay officials
- ✅ **Mobile-Friendly** - Works on phones and tablets
- ✅ **Offline Support** - View cached data during brownouts

## 🖼️ Screenshots

### Dashboard
![Dashboard showing resident count and recent activities](images/screenshot-dashboard.png)

### Resident Search
![Search interface for finding residents](images/screenshot-search.png)

## 🚀 Getting Started

### Prerequisites

Make sure you have these installed:
- **Node.js** (version 14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download here](https://git-scm.com/)
- **Web browser** (Chrome, Firefox, or Edge recommended)

### Installation

1. **Clone this repository**
   ```bash
   git clone https://github.com/your-username/barangay-system.git
   cd barangay-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env file with your settings (optional for local development)
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open in your browser**
   - Navigate to: http://localhost:3000
   - You should see the barangay system homepage

### First Time Setup

1. The system will create sample data automatically
2. Default admin login:
   - Username: `admin`
   - Password: `barangay2024`
3. Change the password after first login!

## 📖 How to Use

### For Residents:
1. Visit the website
2. Click "Request Clearance"
3. Fill out the form with your information
4. Submit and wait for approval
5. Check status using your reference number

### For Barangay Officials:
1. Log in with your credentials
2. View pending clearance requests
3. Approve or deny requests
4. Post announcements
5. Update resident information

## 🛠️ Built With

- **Frontend:**
  - HTML5, CSS3, JavaScript
  - Bulma CSS Framework (for styling)
  
- **Backend:**
  - Node.js with Express
  - EJS (template engine)
  
- **Data Storage:**
  - JSON files (for learning - would use database in production)

## 📂 Project Structure

```
barangay-system/
├── views/              # EJS templates
│   ├── index.ejs       # Homepage
│   ├── residents.ejs   # Resident directory
│   └── clearance.ejs   # Clearance system
├── public/             # Static files
│   ├── css/
│   │   └── styles.css  # Custom styles
│   ├── js/
│   │   └── app.js      # Client-side JavaScript
│   └── images/         # Images and icons
├── data/               # JSON data storage
│   ├── residents.json  # Resident records
│   ├── clearances.json # Clearance requests
│   └── officials.json  # Barangay officials
├── server.js           # Express server
├── package.json        # Dependencies
├── .env.example        # Environment variables template
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## 🇵🇭 Philippine Context

This project is designed specifically for Philippine barangays:

- **Terminology:** Uses Filipino terms (Kagawad, Kapitan, SK Chairman)
- **Forms:** Based on actual barangay forms and requirements
- **Addressing:** Philippine address format (sitio, purok, barangay)
- **Offline Support:** Works during brownouts (common in Philippines)
- **Mobile-First:** Most residents access via smartphones
- **Low Data Usage:** Optimized for slow 3G/4G connections

## 🎯 Learning Objectives

This project teaches:
- ✅ Building full-stack web applications
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Form handling and validation
- ✅ Responsive design for mobile devices
- ✅ Working with JSON data
- ✅ Git and GitHub collaboration
- ✅ Deployment to hosting platforms

## 🤝 Contributing

We welcome contributions from classmates! Here's how:

### Reporting Bugs
1. Check if the bug is already reported in [Issues](https://github.com/your-username/barangay-system/issues)
2. If not, create a new issue with:
   - Clear title
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)

### Suggesting Features
1. Open an issue with the "enhancement" label
2. Describe the feature and why it's useful
3. Wait for discussion before implementing

### Code Contributions
1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/add-notification-system
   ```
3. Make your changes
4. Test thoroughly
5. Commit with clear messages:
   ```bash
   git commit -m "Add email notifications for clearance approvals"
   ```
6. Push to your fork:
   ```bash
   git push origin feature/add-notification-system
   ```
7. Open a Pull Request with:
   - Description of changes
   - Why this improves the project
   - Screenshots/demos if UI changes

## 🐛 Known Issues

- [ ] Clearance PDF export not working on mobile Safari
- [ ] Search is case-sensitive (should be case-insensitive)
- [ ] No pagination for large resident lists

See [Issues](https://github.com/your-username/barangay-system/issues) for full list.

## 🚧 Future Improvements

- [ ] Add SMS notifications for clearance status
- [ ] Implement user authentication with password hashing
- [ ] Switch to PostgreSQL database for production
- [ ] Add photo upload for resident profiles
- [ ] Generate PDF clearances automatically
- [ ] Add print-friendly layouts
- [ ] Multi-barangay support

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👥 Authors

**Grade 9 - Section Einstein Team:**
- **Juan dela Cruz** - Project Lead - [@juandc](https://github.com/juandc)
- **Maria Santos** - Frontend Developer - [@mariasantos](https://github.com/mariasantos)
- **Jose Reyes** - Backend Developer - [@josereyes](https://github.com/josereyes)

## 🙏 Acknowledgments

- **Sir Rodriguez** - Our Computer Science teacher for guidance and support
- **Barangay San Juan** - For providing sample forms and requirements
- **Bulma CSS** - For the responsive framework
- **Express.js Community** - For excellent documentation
- **Our classmates** - For testing and feedback

## 📧 Contact

Questions or suggestions?
- Create an [issue](https://github.com/your-username/barangay-system/issues)
- Email the team: barangay.system.group@gmail.com
- Visit our project blog: [link to blog if any]

## 📚 Resources

Helpful links for understanding this project:
- [Express.js Tutorial](https://expressjs.com/en/starter/installing.html)
- [Bulma CSS Documentation](https://bulma.io/documentation/)
- [Git and GitHub Basics](https://guides.github.com/)
- [Philippine Barangay System Overview](https://en.wikipedia.org/wiki/Barangay)

---

**Note:** This is a student learning project created for educational purposes. Not for actual government use without proper security audits and compliance checks.

**Made with ❤️ in the Philippines**
