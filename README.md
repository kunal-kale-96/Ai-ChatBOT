# 🤖 AI ChatBot

AI ChatBot is a conversational system that uses a GPT-based model to generate natural, context-aware responses. It provides a simple chat interface where users can interact with the AI, and also supports a feedback mechanism. Users can like or dislike responses, and this feedback (with date & time) is stored in **MongoDB** to track satisfaction and improve performance over time. The system is built with **Node.js/Express** for the backend, **MongoDB** for storage, and a simple **frontend interface** (HTML/CSS/JS or React).  

### Features & Workflow
- Users type queries in the chat interface and receive AI-generated responses.  
- Feedback buttons (like/dislike) allow users to rate the quality of responses.  
- Feedback data is stored in MongoDB with timestamps for later analysis.  
- This helps in improving response accuracy and overall user experience.  

### Tech Stack
- **Frontend:** HTML, CSS, JavaScript (React or Vanilla)  
- **Backend:** Node.js, Express  
- **Database:** MongoDB  
- **AI Model:** GPT-based (e.g., GPT-3 or integrated model)  





run project using

npm run dev