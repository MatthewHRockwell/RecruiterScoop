# eView | The Professional Accountability Utility

eView is a specialized platform designed to bring transparency and data-driven accountability to the recruitment and hiring process. By aggregating verified, anonymous reviews of recruiters and hiring teams, eView transforms anecdotal gossip into actionable data. The platform allows candidates to rate processes based on objective milestones such as salary transparency, feedback timeliness, and professional conduct.

## Project Overview

This application is a Single Page Application (SPA) built to be fast, responsive, and secure. It utilizes a serverless architecture for scalability and ease of deployment. The core functionality revolves around searching for recruitment professionals, viewing aggregated sentiment data, and submitting structured process reviews.

### Key Features

* **Dynamic Search Engine:** Real-time filtering of recruiters and hiring firms.
* **Verified Review System:** Logic to fingerprint browsers and verify distinct interactions to prevent spam while maintaining user anonymity.
* **Structured Rating Data:** Reviews are categorized by specific process tags (e.g., "Salary Provided," "Ghosting," "Timely Feedback") rather than just arbitrary star ratings.
* **Responsive Interface:** Fully optimized for desktop and mobile devices using a modern utility-first CSS framework.
* **Real-time Database:** Instant updates for review counts and aggregate scores via cloud-hosted NoSQL database.

## Technical Architecture

The project is built using a modern JavaScript stack, leveraging Vite for build tooling and Firebase for backend services.

### Frontend
* **Framework:** React (v18+)
* **Build Tool:** Vite
* **Styling:** Tailwind CSS
* **Icons:** Lucide React
* **Routing:** Conditional rendering via custom Layout state management.

### Backend & Services
* **Authentication:** Firebase Auth (Anonymous Sign-in and Token management).
* **Database:** Cloud Firestore (NoSQL data structure).
* **Hosting:** Firebase Hosting.

## Project Structure

The codebase is modularized to separate configuration, logic, and presentation layers.

```text
src/
├── assets/          # Static image and SVG resources
├── components/      # Reusable UI components (views and functional blocks)
│   ├── Layout.jsx   # Main application wrapper (Navbar/Footer)
│   ├── Home.jsx     # Landing page and search interface
│   └── ...          # Additional feature components
├── config/          # External service configuration (Firebase)
├── constants/       # Static data (Tag definitions, App IDs)
├── utils/           # Helper functions (Fingerprinting, formatting)
└── App.jsx          # Main application controller and routing logic
```

## Installation and Setup

Follow these steps to set up the project locally for development.

### Prerequisites
* Node.js (v16.0.0 or higher)
* npm (Node Package Manager)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd RecruiterScoop
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration

Ensure your Firebase configuration keys are correctly set in `src/config/firebase.js`. For production environments, it is recommended to use environment variables (`.env`).

### 4. Run Development Server
```bash
npm run dev
```

## Deployment

This project is configured for deployment via Firebase Hosting.

1.  **Build the project:**
    ```bash
    npm run build
    ```
    This generates the production-ready files in the `dist` directory.

2.  **Deploy to Firebase:**
    ```bash
    firebase deploy
    ```

## Contributing

This repository is maintained by the eView technical team. Code contributions should follow the existing modular structure. Ensure all new components are created with the `.jsx` extension and that utility functions are separated into the `utils` directory.

## Contact Information

For inquiries regarding the platform, partnerships, or technical support, please contact:

* **Contact Name:** Matthew Rockwell
* **Contact Email:** contact@ReVieweReView.com
* **Contact LinkedIn:** [eView](https://www.linkedin.com/company/reviewereview)
* **Contact X:** [@eView](https://x.com/ReVieweReView)

---

**© 2025 Rockwell Industries LLC. All Rights Reserved.**