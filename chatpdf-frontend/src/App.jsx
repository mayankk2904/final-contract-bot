import { useState } from 'react';
import axios from 'axios';
import { signInWithPopup, signOut, provider, auth } from './firebase';
import { AiOutlinePaperClip } from 'react-icons/ai';
import { FaTimes } from 'react-icons/fa';
import SignupForm from './SignupForm'; 
import './App.css';

function App() {
  const [user, setUser] = useState(null); // For Google login user
  const [pdf, setPdf] = useState(null); // For uploaded PDF
  const [status, setStatus] = useState(''); // For load document status
  const [question, setQuestion] = useState(''); // For user questions
  const [messages, setMessages] = useState([]); // For chat messages
  const [showSignup, setShowSignup] = useState(false); // Toggle between signup and login

  // Handle PDF upload
  const handlePdfChange = (e) => {
    setPdf(e.target.files[0]);
  };

  // Load PDF to backend
  const loadDoc = async () => {
    const formData = new FormData();
    formData.append('pdf', pdf);

    try {
      const response = await axios.post('http://localhost:5000/load_doc', formData);
      setStatus(response.data);
      alert(response.data);
    } catch (error) {
      setStatus('Error loading document.');
    }
  };

  // Remove uploaded PDF
  const removePdf = () => {
    setPdf(null);
    setStatus('');
  };

  // Submit user question
  const submitQuery = async () => {
    try {
      const response = await axios.post('http://localhost:5000/answer_query', { query: question });
      setMessages([...messages, { role: 'user', content: question }, { role: 'bot', content: response.data }]);
      setQuestion('');
    } catch (error) {
      setMessages([...messages, { role: 'bot', content: 'Error answering query.' }]);
    }
  };

  // Google Login
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      const idToken = await result.user.getIdToken();
      // Pass the token to the backend for verification
      await axios.post('http://localhost:5000/login', { token: idToken });
    } catch (error) {
      console.error(error);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      {/* Toggle between Signup and Google Login */}
      <div className="flex justify-between">
        {user ? (
          <div>
            <p>Welcome, {user.displayName}</p>
            <button onClick={handleLogout} className="p-2 bg-red-500 text-white rounded">Logout</button>
          </div>
        ) : showSignup ? (
          <SignupForm />
        ) : (
          <button onClick={handleGoogleLogin} className="p-2 bg-blue-500 text-white rounded">Login with Google</button>
        )}
      </div>

      {/* Toggle Button to switch between Login and Signup */}
      <div className="mt-4">
        {user ? null : (
          <button
            onClick={() => setShowSignup(!showSignup)}
            className="p-2 bg-gray-500 text-white rounded"
          >
            {showSignup ? 'Back to Google Login' : 'Signup with Email'}
          </button>
        )}
      </div>

      {/* Message Display */}
      <div className="flex-grow overflow-auto p-4">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'bot' ? 'justify-start' : 'justify-end'}`}>
              <div className={`p-3 rounded-lg ${msg.role === 'bot' ? 'bg-gray-200' : 'bg-blue-500 text-white'}`}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Query and PDF Upload Section */}
      <div className="flex items-center p-4 bg-gray-100">
        <AiOutlinePaperClip className="text-xl cursor-pointer mr-2" onClick={() => document.getElementById('fileInput').click()} />
        <input type="file" id="fileInput" className="hidden" onChange={handlePdfChange} />
        <button onClick={loadDoc} className="p-2 bg-blue-500 text-white rounded mr-4">Load PDF</button>
        <input
          type="text"
          placeholder="Type in your question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="p-2 border border-gray-300 rounded flex-grow"
        />
        <button onClick={submitQuery} className="ml-2 p-2 bg-green-500 text-white rounded">Submit</button>
      </div>

      {/* PDF Status Display */}
      {pdf && (
        <div className="flex items-center p-2 bg-gray-200 border-t border-gray-300">
          <span className="flex-grow text-gray-700">{pdf.name}</span>
          <FaTimes className="text-red-500 cursor-pointer" onClick={removePdf} />
        </div>
      )}
    </div>
  );
}

export default App;
