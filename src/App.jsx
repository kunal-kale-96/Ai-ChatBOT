// App.jsx
import { useState, useEffect, useRef } from "react";
import "./App.css";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faShareAlt, faHistory, faTrash } from "@fortawesome/free-solid-svg-icons";

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasDisliked, setHasDisliked] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentQAId, setCurrentQAId] = useState(null);
  const [qaHistory, setQAHistory] = useState([]);

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('qaHistory');
    if (savedHistory) {
      setQAHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('qaHistory', JSON.stringify(qaHistory));
  }, [qaHistory]);

  const showFeedbackMessage = (message) => {
    setFeedbackMessage(message);
    setShowFeedback(true);
    setTimeout(() => {
      setShowFeedback(false);
    }, 2000);
  };

  async function generateAnswer() {
    if (!question.trim()) {
      setError("Please enter a valid question.");
      return;
    }

    setIsLoading(true);
    setAnswer("");
    setError(null);
    setLikes(0);
    setDislikes(0);
    setHasLiked(false);
    setHasDisliked(false);

    try {
      const response = await axios({
        url: "#API_KEY,
        method: "post",
        data: { contents: [{ parts: [{ text: question }] }] },
      });

      const result = response.data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (result) {
        const formattedAnswer = formatAnswer(result);
        setAnswer(formattedAnswer);
        
        // Add to history with unique ID
        const newQAId = Date.now();
        setCurrentQAId(newQAId);
        
        const newQA = {
          id: newQAId,
          question: question,
          answer: formattedAnswer,
          timestamp: new Date().toLocaleString(),
          feedback: {
            likes: 0,
            dislikes: 0,
            hasLiked: false,
            hasDisliked: false
          }
        };
        setQAHistory(prev => [newQA, ...prev]);
      } else {
        setAnswer("No response from AI.");
      }
    } catch (error) {
      setError("Error generating response. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }

  function formatAnswer(rawAnswer) {
    const sanitizedAnswer = rawAnswer
      .replace(/[^a-zA-Z0-9\s.,:;!?]/g, "")
      .trim();
    const paragraphs = sanitizedAnswer
      .split(/\n+/)
      .map((para) => para.trim())
      .filter(Boolean);

    return paragraphs.map((para) => `<p>${para}</p>`).join("");
  }

  const handleLike = (id = null) => {
    const targetId = id || currentQAId;
    
    if (!targetId) return;

    setQAHistory(prev => prev.map(qa => {
      if (qa.id === targetId) {
        const newFeedback = {
          ...qa.feedback,
          likes: !qa.feedback.hasLiked ? qa.feedback.likes + 1 : qa.feedback.likes,
          hasLiked: !qa.feedback.hasLiked,
          dislikes: qa.feedback.hasDisliked ? qa.feedback.dislikes - 1 : qa.feedback.dislikes,
          hasDisliked: false
        };

        // Update current state if this is the current QA
        if (targetId === currentQAId) {
          setLikes(newFeedback.likes);
          setDislikes(newFeedback.dislikes);
          setHasLiked(newFeedback.hasLiked);
          setHasDisliked(newFeedback.hasDisliked);
        }

        return {
          ...qa,
          feedback: newFeedback
        };
      }
      return qa;
    }));

    showFeedbackMessage("Thanks for your positive feedback! 😊");
  };

  const handleDislike = (id = null) => {
    const targetId = id || currentQAId;
    
    if (!targetId) return;

    setQAHistory(prev => prev.map(qa => {
      if (qa.id === targetId) {
        const newFeedback = {
          ...qa.feedback,
          dislikes: !qa.feedback.hasDisliked ? qa.feedback.dislikes + 1 : qa.feedback.dislikes,
          hasDisliked: !qa.feedback.hasDisliked,
          likes: qa.feedback.hasLiked ? qa.feedback.likes - 1 : qa.feedback.likes,
          hasLiked: false
        };

        // Update current state if this is the current QA
        if (targetId === currentQAId) {
          setLikes(newFeedback.likes);
          setDislikes(newFeedback.dislikes);
          setHasLiked(newFeedback.hasLiked);
          setHasDisliked(newFeedback.hasDisliked);
        }

        return {
          ...qa,
          feedback: newFeedback
        };
      }
      return qa;
    }));

    showFeedbackMessage("Thanks for your feedback. We'll try to improve! 🤔");
  };

  const deleteHistoryItem = (id) => {
    if (id === currentQAId) {
      setAnswer("");
      setCurrentQAId(null);
      setLikes(0);
      setDislikes(0);
      setHasLiked(false);
      setHasDisliked(false);
    }
    setQAHistory(prev => prev.filter(qa => qa.id !== id));
    showFeedbackMessage("History item deleted!");
  };

  const clearHistory = () => {
    setQAHistory([]);
    setAnswer("");
    setCurrentQAId(null);
    setLikes(0);
    setDislikes(0);
    setHasLiked(false);
    setHasDisliked(false);
    showFeedbackMessage("History cleared!");
  };

  const loadFromHistory = (qa) => {
    setQuestion(qa.question);
    setAnswer(qa.answer);
    setCurrentQAId(qa.id);
    setLikes(qa.feedback.likes);
    setDislikes(qa.feedback.dislikes);
    setHasLiked(qa.feedback.hasLiked);
    setHasDisliked(qa.feedback.hasDisliked);
    setShowHistory(false);
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-title">
          <img
            src="https://th.bing.com/th/id/OIP.AzAHS3oN36RP_6vqygXUyQHaHa?rs=1&pid=ImgDetMain"
            alt="Chat AI Icon"
            className="custom-icon"
          />
          <h1>ChatGpt</h1>
        </div>
        <div className="navbar-icons">
          <button 
            className="icon-button"
            onClick={() => setShowHistory(!showHistory)}
            aria-label="History"
          >
            <FontAwesomeIcon icon={faHistory} />
          </button>
          <button className="icon-button" aria-label="Share">
            <FontAwesomeIcon icon={faShareAlt} />
          </button>
          <button className="icon-button" aria-label="Email login">
            <FontAwesomeIcon icon={faEnvelope} />
          </button>
        </div>
      </nav>

      <div className="content-container">
        {showFeedback && (
          <div className="feedback-popup">
            {feedbackMessage}
          </div>
        )}

        {showHistory && (
          <div className="history-panel">
            <div className="history-header">
              <h2>History</h2>
              <button 
                className="clear-history-button"
                onClick={clearHistory}
                aria-label="Clear history"
              >
                Clear All
              </button>
            </div>
            {qaHistory.length === 0 ? (
              <p className="no-history">No history available</p>
            ) : (
              <div className="history-list">
                {qaHistory.map((qa) => (
                  <div key={qa.id} className="history-item">
                    <div className="history-content" onClick={() => loadFromHistory(qa)}>
                      <div className="history-question">{qa.question}</div>
                      <div className="history-timestamp">{qa.timestamp}</div>
                    </div>
                    <div className="history-feedback">
                      <button
                        className={`feedback-button like-button ${qa.feedback.hasLiked ? 'active' : ''}`}
                        onClick={() => handleLike(qa.id)}
                      >
                        👍 {qa.feedback.likes}
                      </button>
                      <button
                        className={`feedback-button dislike-button ${qa.feedback.hasDisliked ? 'active' : ''}`}
                        onClick={() => handleDislike(qa.id)}
                      >
                        👎 {qa.feedback.dislikes}
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => deleteHistoryItem(qa.id)}
                        aria-label="Delete"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <textarea
          className="input-box"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask me anything..."
          rows="8"
          aria-label="Input question"
        ></textarea>

        {error && <div className="error-message">{error}</div>}

        <button
          onClick={generateAnswer}
          disabled={isLoading}
          className={`submit-button ${isLoading ? "disabled" : ""}`}
          aria-label={isLoading ? "Generating answer" : "Generate answer"}
        >
          {isLoading ? "Generating..." : "Generate Answer"}
        </button>

        {answer && (
          <div className="answer-box">
            <div dangerouslySetInnerHTML={{ __html: answer }} />
            <div className="feedback-buttons">
              <button
                className={`feedback-button like-button ${hasLiked ? 'active' : ''}`}
                onClick={() => handleLike()}
              >
                👍 {likes}
              </button>
              <button
                className={`feedback-button dislike-button ${hasDisliked ? 'active' : ''}`}
                onClick={() => handleDislike()}
              >
                👎 {dislikes}
              </button>
            </div>
          </div>
        )}
      </div>

      <footer className="footer">
        <p className="footer-text">
          ChatGPT can make mistakes. Check important information.
        </p>
      </footer>
    </div>
  );
}

export default App;
