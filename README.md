# 🎵 TuneIn — Social Music Streaming

TuneIn is a lightweight real-time app for synchronized music listening with friends in virtual rooms, built with React, Node.js, Socket.IO and YouTube integration.

![TuneIn Demo](./demo/tunein-demo.gif)

## Key Features

- Real-time synchronized playback across clients (server-driven timestamps)
- Collaborative queue and room-based listening
- Live chat, skip voting, and viewer tracking
- JWT authentication and secure APIs
- Image uploads for room thumbnails (Imgur)

## Tech Stack

- Backend: Node.js, Express, MongoDB Atlas, Socket.IO
- Frontend: React, MUI, React Router, YouTube Embedded Player
- APIs: YouTube Data API, Imgur

## Quick Start

Prerequisites: Node.js 18+, npm or yarn, MongoDB Atlas, YouTube API key, Imgur credentials.

1. Clone:
```bash
git clone https://github.com/Liron4/TuneIn.git
cd TuneIn
```

2. Setup Backend:
```bash
cd backend
npm install
```

3. Setup Frontend:
```bash
cd ../tunein-react
npm install
```

4. Environment Configuration (Backend `.env`):
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/
JWT_SECRET=your_super_secret_key_here
IMGUR_CLIENT_ID=your_imgur_client_id
IMGUR_CLIENT_SECRET=your_imgur_client_secret
YOUTUBE_API_KEY=your_youtube_api_key
```

5. Run Backend:
```bash
cd backend
npm run dev
```

6. Run Frontend:
```bash
cd tunein-react
npm start
```

Access at http://localhost:3000.

## 📁 Project Structure

```
TuneIn/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── app.js
│   └── package.json
├── tunein-react/
│   ├── src/
│   │   ├── Components/
│   │   ├── Pages/
│   │   └── App.js
│   └── package.json

```

## 📧 Contact

Liron - [@Liron4](https://github.com/Liron4)

Project Link: [https://github.com/Liron4/TuneIn](https://github.com/Liron4/TuneIn)

---

⭐ **Star this repository if you found it helpful!**
