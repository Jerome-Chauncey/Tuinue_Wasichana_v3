# Tuinue Wasichana

## Overview

Tuinue Wasichana is a web application designed to empower girls across Africa by addressing period poverty and educational barriers. The platform connects donors with charities, provides educational resources, shares impactful stories, and facilitates donations through a user-friendly interface. The app features a feminine color palette (pink #FFC1CC, coral #FF6F61, purple #D8BFD8, teal #4DB6AC, cream #FFF8F0), clean typography, and a responsive design.

## Features

- **Homepage**: Displays a hero section, impact statistics, charity listings, success stories, and a call-to-action (CTA) for donations.
- **Authentication**: Supports login/register functionality for donors, charities, and admins.
- **Dashboards**: Donor, charity, and admin dashboards for managing contributions, profiles, and approvals.
- **Charity Profiles**: Detailed views of charities with donation options.
- **Stories**: Showcases inspiring narratives from supported communities.
- **Donation System**: Allows credit purchases and donations to charities.
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices.

## Tech Stack

### Frontend

- **React**: JavaScript library for building the user interface.
- **React-Bootstrap**: Component library for responsive styling and layout.
- **Bootstrap**: CSS framework for grid systems and base styles.
- **React-Toastify**: Library for user feedback notifications.
- **React-Router-Dom**: Handles client-side routing.
- **Axios**: Facilitates API requests for dynamic content.
- **Font Awesome**: Provides icons for visual cues.
- **Google Fonts**: Supplies `Montserrat` and `Open Sans` for typography.

### Backend

- **Flask**: Python framework (assumed based on API endpoints like `/api/verify-token`).
- **SQLAlchemy**: ORM for database interactions (assumed from PostgreSQL usage).
- **PostgreSQL**: Relational database for storing user, charity, and story data.

### Development Tools

- **Node.js**: Runtime for frontend development.
- **npm**: Package manager for frontend dependencies.
- **Git**: Version control.
- **Render**: Deployment platform 

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- PostgreSQL
- Python 3.x (for backend, if not pre-configured)
- Git

### Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/Jerome-Chauncey/Tuinue_Wasichana_v3
   cd tuinue-wasichana
   ```

2. **Backend Setup**

   - Navigate to the backend directory (e.g., `backend`).
   - Install dependencies (adjust based on your backend setup):

     ```bash
     pip install -r requirements.txt
     ```
   - Configure environment variables in a `.env` file:

     ```
     SQLALCHEMY_DATABASE_URI=postgresql://jeromechauncey@localhost/tuinue
     JWT_SECRET_KEY=your_secure_key
     SECRET_KEY=your_secure_key
     ```
   - Initialize the database:

     ```bash
     psql -U jeromechauncey -d postgres
     CREATE DATABASE tuinue;
     \c tuinue
     ```

     Apply migrations or run schema setup as per your backend code.
   - Start the backend:

     ```bash
     python app.py
     ```

3. **Frontend Setup**

   - Navigate to the frontend directory:

     ```bash
     cd frontend
     ```
   - Install dependencies:

     ```bash
     npm install
     ```
   - Start the development server:

     ```bash
     npm start
     ```
   - Open `http://localhost:3000` in your browser.

4. **Database Seed (Optional)**

   - Insert sample data:

     ```sql
     psql -U jeromechauncey -d tuinue
     INSERT INTO charity (user_id, name, description, photo_url, approved, rejected) VALUES
       (1, 'Test Charity', 'Empowering girls through education', 'https://via.placeholder.com/300', true, false);
     INSERT INTO story (charity_id, title, content, photo_url, date) VALUES
       (1, 'A Girl’s Journey', 'Thanks to reusable pads, Sarah stays in school.', 'https://via.placeholder.com/200', '2025-07-30 17:00:00');
     ```

## Configuration

- Update `API_URL` in `Home.js` to your backend URL for production:

  ```javascript
  const API_URL = 'https://your-backend-url.com/api';
  ```
- Ensure all image URLs (e.g., `hero-image.jpg`) are HTTPS-compliant and placed in `frontend/public/`.

## Deployment

1. **Build Frontend**

   ```bash
   cd frontend
   npm run build
   ```
2. **Deploy to Render**
   - Push to Git.
   - Configure `Procfile` for backend:

     ```
     web: gunicorn --workers 3 --bind 0.0.0.0:$PORT app:app
     ```
   - Set environment variables in Render dashboard.
3. **Backup Database**

   ```bash
   pg_dump -U jeromechauncey tuinue > tuinue_backup_20250731.sql
   ```

## Testing

- **Unit Tests**: Add tests for components and API calls (e.g., using Jest, pytest).
- **Manual Testing**:
  - Verify responsiveness (DevTools: iPhone, iPad, desktop).
  - Test navigation, authentication, and API data loading.
  - Check accessibility (Lighthouse, WebAIM Contrast Checker).
- **API Endpoints**: Ensure `/api/charities`, `/api/stories`, `/api/verify-token` work.

## Contributing

1. Fork the repository.
2. Create a feature branch:

   ```bash
   git checkout -b feature/new-feature
   ```
3. Commit changes:

   ```bash
   git commit -m "Add new feature"
   ```
4. Push to the branch:

   ```bash
   git push origin feature/new-feature
   ```
5. Open a pull request.



## Acknowledgments

- Images sourced from Unsplash/Pexels (ensure HTTPS compliance).
- Thanks to the open-source community for libraries like React, Bootstrap, and Flask.



