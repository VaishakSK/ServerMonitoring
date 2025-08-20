# 🌐 Server Monitoring System  

A **comprehensive server monitoring system** built with **Node.js, Express, MongoDB, and Socket.io**, designed to track system health, performance, and resource usage in real time.  
This platform allows administrators to **add servers, monitor metrics (CPU, RAM, Disk, Network), get real-time alerts, and manage server data** through an interactive dashboard.  

---

## 📂 Project Structure  

```
server-monitoring-system/
│── Frontend/                # Views and static assets
    ├── views/               # Handlebars (hbs) templates
    ├── public/              # CSS, JS, images
    │── models/              # Mongoose models
    │── routes/              # Express routes
    │── app.js               # Main application file
    │── package.json         # Dependencies and scripts
    │── .env                 # Environment variables (not in repo)
    │── .gitignore           # Ignored files (node_modules, .env)
```

---

## ⚙️ Installation  

### 1. Clone the Repository  
```bash
git clone https://github.com/your-username/server-monitoring-system.git
cd server-monitoring-system
```

### 2. Install Dependencies  
```bash
npm install
```

### 3. Setup Environment Variables  

Create a `.env` file in the root folder:  

```ini
PORT= your-port-number
MONGO_URI= your-mongo-url
SESSION_SECRET=your-session-secret
SECURITY_CODE=your-custom-security-code
```
  

### 4. Run the Project  

**Start in production mode**:  
```bash
npm start
```

**Start in development mode (with auto-reload using nodemon)**:  
```bash
npm run dev
```

**Run tests**:  
```bash
npm test
```

---

## 🚀 Usage  

1. Start the server.  
2. Open your browser: http://localhost:$PORT 
3. Login/Register with credentials.  
4. Add servers with the **security code**.  
5. Monitor server metrics in real time.  

---

## 🛠️ Technologies Used  

- **Backend**: Node.js, Express.js  
- **Frontend**: Handlebars (HBS), CSS, JavaScript  
- **Database**: MongoDB, Mongoose  
- **Authentication**: Passport.js, JWT, bcryptjs  
- **Security**: Sessions  
- **Monitoring**: Node Exporter  

---
# 🖥️ Installing Windows Exporter (for Windows Servers)

To enable server monitoring on Windows, install Windows Exporter (Prometheus-compatible exporter for Windows).

Go to 👉 Windows Exporter Releases

Download the latest .msi installer (example: windows_exporter-0.31.2-amd64.msi).

Run the .msi file and complete the installation.

✅ Once installed, Windows Exporter runs as a Windows Service (24/7) and exposes metrics at:
http://localhost:9182/metrics
