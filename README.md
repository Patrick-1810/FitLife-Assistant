# ChatGPT Clone

A simple **ChatGPT clone** built using the **MERN stack (MongoDB, Express.js, React, Node.js)**. This project uses the **OpenAI API** to allow human-like conversations, just like the real ChatGPT.

---

## ✨ Features

* Chat with AI (using OpenAI)
* Google login & signup
* Email/password login
* Forgot password option
* Save chat history
* Auto-save chat
* Delete account option
* Light & Dark modes
* Works offline (PWA)
* Mobile responsive design

---

## 🛠️ Tech Stack

**Frontend:**

* Vite
* React.js
* SCSS
* Redux Toolkit

**Backend:**

* Node.js
* Express.js
* MongoDB
* JSON Web Token (JWT) for authentication

**Others:**

* OpenAI API
* Google Login
* JavaScript

---

## ✅ Prerequisites

Before you begin, make sure you have the following installed:

* [Node.js & npm](https://nodejs.org/)
* [MongoDB](https://www.mongodb.com/)
* [Git](https://git-scm.com/)
* An [OpenAI API key](https://openai.com/api/)

---

## 🔐 Environment Variables

### Backend (`/server/.env`)

Create a `.env` file inside the `server` folder with the following:

```
PORT=5000
MONGO_URL=your_mongodb_connection_string
SITE_URL=http://localhost:5173
JWT_PRIVATE_KEY=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
OPENAI_ORGANIZATION=your_openai_organization_id
MAIL_EMAIL=your_email@example.com
MAIL_SECRET=your_email_secret
```

### Frontend (`/client/.env.local`)

Create a `.env.local` file inside the `client` folder with:

```
VITE_CLIENT_ID=your_google_oauth_client_id
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/ansonbenny/ChatGPT.git
```

---

### 2. Start the Backend

```bash
cd ChatGPT/server
npm install
npm start
```

---

### 3. Start the Frontend

```bash
cd ChatGPT/client
npm install
npm run dev
```

---

## 🌐 Access the App

Once both the frontend and backend are running, open your browser and go to:

```
http://localhost:5173
```

---

## 📌 Notes

* You need an OpenAI API key for the chat to work.
* Google login requires a valid OAuth Client ID (you can get it from the [Google Developer Console](https://console.cloud.google.com/)).
* For email features like "Forgot Password", you need to configure email credentials correctly.

---

## Demo

[Live](https://chatgpt-8z57.onrender.com)

https://user-images.githubusercontent.com/94070164/236692494-a50edafc-7864-439a-9cb3-fa112abc00a6.mp4

![Screenshot_2023-04-28_12-45-28](https://user-images.githubusercontent.com/94070164/236693044-a4884b84-a058-46ba-ae50-0f9b50f92f02.png)

![Screenshot_2023-04-28_12-45-42](https://user-images.githubusercontent.com/94070164/236693067-fdf687ce-fafc-495b-9b1e-ad19ae18a339.png)

![Screenshot_2023-04-28_12-45-55](https://user-images.githubusercontent.com/94070164/236693075-429a387d-91d8-495a-afe4-84201ad43ef2.png)

![auth](https://user-images.githubusercontent.com/94070164/236693311-13089e93-3b50-4187-8203-b122a7016b71.png)

![login](https://user-images.githubusercontent.com/94070164/236693346-08e08ae2-c265-4743-b9f6-e4899c4168bb.png)

![login2](https://user-images.githubusercontent.com/94070164/236693355-f976a480-8a98-4b2b-92d0-542bdd03957c.png)

![forgot](https://user-images.githubusercontent.com/94070164/236693362-ceff0f29-d7bd-4787-9445-df65b00650ff.png)

![reg](https://user-images.githubusercontent.com/94070164/236693371-97fe8ed6-f33b-4f4e-a195-8ef4d0f8b78f.png)

![reg2](https://user-images.githubusercontent.com/94070164/236693378-dba41424-ca47-4b57-861f-508d8c3b8f5b.png)

![offline](https://user-images.githubusercontent.com/94070164/236693384-d3c86f92-b773-46e4-823c-79c26004737d.png)

![Screenshot_2023-04-28_19-28-07](https://user-images.githubusercontent.com/94070164/236693084-8e6df9e7-9e12-427d-a63f-1123145e50f8.png)

![app](https://user-images.githubusercontent.com/94070164/236693396-32687dc4-cf32-45a8-8e93-5a1e9fefa1c1.png)



## 🔗 Links
[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/anson-benny-502961238/)
