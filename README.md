# Student Counseling System 🎓

An end-to-end automated Student Counseling & Appointment Management System featuring automated Zoom meeting generation, email notifications, and an intuitive booking interface.

---

## 🌟 Features

- **Session Scheduling**: Students can pick counseling categories, dates, and available time slots.
- **Automated Video Conferencing**: Integrates with Zoom API (Server-to-Server OAuth) to automatically generate meeting links and passcodes upon booking.
- **Instant Email Confirmations**: Sends formatted confirmation emails with meeting links to students using Nodemailer.
- **Admin Dashboard**: View and manage booked sessions, follow-up statuses, and session records.
- **Chatbot & Assistance**: Interactive student support interface for counseling inquiries.
- **SQLite Database**: Lightweight, zero-configuration local database storing student appointment history.

---

## 📁 Project Structure

```text
student-counseling-system/
├── backend/                  # Node.js & Express API server
│   ├── config/               # Database and environment configurations
│   ├── controllers/          # Booking & business logic
│   ├── routes/               # Express API endpoints
│   ├── services/             # Zoom & Nodemailer integration services
│   ├── .env.example          # Sample environment variables
│   ├── package.json          # Node dependencies
│   └── server.js             # Express entry point
├── frontend/                 # Python Flask web application
│   ├── static/               # CSS styles and static assets
│   ├── templates/            # HTML templates (booking, admin, chat, calendar)
│   ├── app.py                # Flask application routes
│   └── database.py           # SQLite initialization & helper queries
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+) & **npm**
- **Python** (v3.9+) & **pip**

---

### 2. Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Fill in your Zoom API credentials and email settings:
     ```env
     ZOOM_ACCOUNT_ID=your_zoom_account_id
     ZOOM_CLIENT_ID=your_zoom_client_id
     ZOOM_CLIENT_SECRET=your_zoom_client_secret
     EMAIL=your_email@gmail.com
     EMAIL_PASSWORD=your_app_password
     PORT=5000
     ```

4. Start the backend server:
   ```bash
   node server.js
   ```
   The backend API will run on `http://localhost:5000`.

---

### 3. Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install Python requirements (e.g. `flask`, `requests`):
   ```bash
   pip install flask requests
   ```

3. Run the Flask application:
   ```bash
   python app.py
   ```
   Open `http://127.0.0.1:5000` or the configured port in your browser.

---

## 🔒 Security Note

- **Never commit `.env` or service account credential files** to public repositories.
- Keep your Zoom API secrets and Gmail App Passwords secure.
