📘 AI-Powered Daily Time Tracker

A responsive web application that allows users to log daily activities, track how they spend their 24 hours, and view an analytics dashboard with charts and summaries.
The app uses Firebase Authentication + Firestore, pure HTML/CSS/JavaScript, and Chart.js for data visualization.

🚀 Live Demo

🔗 https://Sravani120407.github.io/ai-time-tracker/

(If Firebase config is not included, some functionality like login will not work. Add your Firebase config in js/firebase-config.js locally.)

📂 GitHub Repository

🔗 https://github.com/Sravani120407/ai-time-tracker

📸 Features
✅ Activity Tracking

Add activities with:

Activity Name

Category

Duration in Minutes

Automatically validates total time (must be ≤ 1440 minutes/day).

Shows remaining time for the selected date.

Edit and delete activities.

✅ Authentication

Firebase Email/Password login

Google Sign-In authentication

Only authenticated users can add/view/analyze activities.

✅ Analytics Dashboard

Includes visual insights such as:

Total daily time spent

Time spent per category

Activity count

Pie Chart of category distribution

Bar Chart of top activities

Daily timeline view

“No data available” screen for empty dates

✅ UI/UX

Fully responsive

Clean modern UI (cards, spacing, colors)

Smooth interactions

Accessible with ARIA labels for screen readers

🛠️ Tech Stack
Layer	Technology
Frontend	HTML, CSS, JavaScript (DOM)
Backend	Firebase Authentication + Firestore
Charts	Chart.js
Hosting	GitHub Pages
Version Control	Git, GitHub
📁 Project Structure
ai-time-tracker/
│
├── index.html
├── README.md
├── .gitignore
│
├── css/
│   └── styles.css
│
├── js/
│   ├── app.js
│   ├── firebase-config.example.js
│   └── firebase-config.js   (NOT committed to GitHub)
│
├── assets/
│   └── images/

🔧 Setup Instructions (For Reviewers / Graders)
1️⃣ Clone the Repository
git clone https://github.com/Sravani120407/ai-time-tracker
cd ai-time-tracker

2️⃣ Create firebase-config.js

Inside js/firebase-config.js:

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};


👉 This file is not committed (it contains private keys).

3️⃣ Enable Firebase Services

In Firebase Console:

Authentication → Enable Email/Password and Google sign-in

Firestore → Create Database (test mode is okay for assignment)

4️⃣ Run the project locally

Simply open index.html in your browser
OR
Run a lightweight server:

npx http-server

🎨 How AI Was Used

Generated UI layout suggestions

Created helper functions & optimized JS logic

Designed the color palette

Helped in writing documentation and structuring components

📹 Video Walkthrough

(Replace with your video link)
🔗 https://youtu.be/your-demo-video

🌱 Future Improvements

Weekly / Monthly analytics

Export time data as CSV

AI suggestions on improving daily time usage

Dark/Light mode toggle

🙌 Author

Sravani
AI Engineering Student — Passionate about building real-world apps with clean UI and Firebase.