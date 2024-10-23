import { useState } from 'react';
import axios from 'axios';
import { signInWithPopup, signOut, provider, auth } from './firebase';
import { AiOutlinePaperClip, AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';
import { FaTimes, FaRobot } from 'react-icons/fa';
import { FiSend } from 'react-icons/fi';
import SignupForm from './SignupForm';
import './App.css';

function App() {
  const [user, setUser] = useState(null); // For Google login user
  const [pdf, setPdf] = useState(null); // For uploaded PDF
  const [status, setStatus] = useState(''); // For load document status
  const [question, setQuestion] = useState(''); // For user questions
  const [currentChat, setCurrentChat] = useState(0); // To track the active chat
  const [chats, setChats] = useState([[]]); // Store multiple chat histories
  const [showSignup, setShowSignup] = useState(false); // Toggle between signup and login
  const [loading, setLoading] = useState(false); // Loading spinner state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Sidebar open state

  // Handle PDF upload
  const handlePdfChange = (e) => {
    setPdf(e.target.files[0]);
  };

  // Load PDF to backend for specific chat
  const loadDoc = async () => {
    if (!pdf) {
      alert('Please select a PDF to upload.');
      return;
    }
    const formData = new FormData();
    formData.append('pdf', pdf);

    try {
      setLoading(true);
      const response = await axios.post(`http://localhost:5000/load_doc?chat_index=${currentChat}`, formData);
      setStatus(response.data);
      alert(response.data);
    } catch (error) {
      setStatus('Error loading document.');
    } finally {
      setLoading(false);
    }
  };

  // Submit user query for specific chat
  const submitQuery = async () => {
    if (!question.trim()) return;

    try {
      setLoading(true);
      const response = await axios.post(`http://localhost:5000/answer_query?chat_index=${currentChat}`, { query: question });
      const newMessage = [
        { role: 'user', content: question, timestamp: new Date().toLocaleTimeString() },
        { role: 'bot', content: response.data, timestamp: new Date().toLocaleTimeString() },
      ];

      const updatedChats = [...chats];
      updatedChats[currentChat] = [...chats[currentChat], ...newMessage];
      setChats(updatedChats);

      setQuestion('');
    } catch (error) {
      const newMessage = [{ role: 'bot', content: 'Error answering query.', timestamp: new Date().toLocaleTimeString() }];
      const updatedChats = [...chats];
      updatedChats[currentChat] = [...chats[currentChat], ...newMessage];
      setChats(updatedChats);
    } finally {
      setLoading(false);
    }
  };

  // Remove uploaded PDF
  const removePdf = () => {
    setPdf(null);
    setStatus('');
  };

  // Create a new chat
  const handleNewChat = () => {
    setChats([...chats, []]); // Add a new empty chat
    setCurrentChat(chats.length); // Switch to the new chat
    setPdf(null); // Reset PDF for new chat
    setStatus(''); // Clear status message
  };

  // Switch to another chat
  const handleSwitchChat = (index) => {
    setCurrentChat(index);
    setPdf(null); // Reset PDF when switching chats
    setStatus(''); // Clear status when switching chats
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
    <div className="flex h-screen">
      {/* Sidebar for Chat History - Display only if user is logged in */}
      {user && (
        <div className={`transition-all duration-300 ${isSidebarOpen ? 'w-1/4' : 'w-16'} bg-gray-900 text-white p-4 overflow-auto`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-lg font-semibold transition-all ${isSidebarOpen ? 'block' : 'hidden'}`}>
              Chats
            </h2>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-xl text-white focus:outline-none">
              {isSidebarOpen ? <AiOutlineClose /> : <AiOutlineMenu />}
            </button>
          </div>
          <button
            onClick={handleNewChat}
            className={`p-2 bg-green-500 hover:bg-green-400 text-white rounded mb-4 w-full transition-all ${isSidebarOpen ? 'block' : 'hidden'}`}
          >
            New Chat
          </button>
          <div className="space-y-4">
            {chats.map((chat, index) => (
              <div
                key={index}
                onClick={() => handleSwitchChat(index)} // Call the switch function here
                className={`p-2 cursor-pointer rounded-lg ${index === currentChat ? 'bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'} transition-all`}
              >
                {isSidebarOpen ? `Chat ${index + 1}` : index + 1}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Chat Window */}
      <div className={`flex-grow bg-gray-100 ${isSidebarOpen ? 'w-3/4' : 'w-full'} transition-all`}>
        <nav className="bg-blue-600 p-4 text-white">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">ContractLens - See Every Detail Clearly</h1>
            <div>
              {!user ? (
                <>
                  <button
                    onClick={handleGoogleLogin}
                    className="mr-4 bg-green-500 hover:bg-green-400 px-4 py-2 rounded transition-all"
                  >
                    Login
                  </button>
                  <button onClick={() => setShowSignup(true)} className="bg-blue-500 hover:bg-blue-400 px-4 py-2 rounded transition-all">
                    Signup
                  </button>
                </>
              ) : (
                <button onClick={handleLogout} className="p-2 bg-red-500 hover:bg-red-400 text-white rounded transition-all">
                  Logout
                </button>
              )}
            </div>
          </div>
        </nav>

        <div className="container mx-auto p-4 h-full flex flex-col">
          {!user ? (
            <div className="flex justify-center items-center h-full flex-col space-y-8 p-6 bg-gradient-to-b from-blue-100 via-white to-blue-100">
              <div className="relative w-24 h-24">
                <div className="absolute top-0 left-0 right-0 bottom-0 m-auto animate-ping-slow bg-blue-300 rounded-full opacity-75"></div>
                <FaRobot className="text-7xl text-blue-600 drop-shadow-lg animate-spin ml-3 mt-2" />
              </div>
              <h1 className="text-4xl font-extrabold text-gray-800 animate-bounce">
                Welcome to <span className="text-blue-600">ContractLens</span>
              </h1>
              <p className="text-xl text-gray-600 animate-fade-in text-center leading-relaxed max-w-lg">
                Your AI-powered assistant for smarter contract analysis. Upload contracts, ask questions, and get real-time, detailed answers. Transform the way you understand agreements with AI precision.
              </p>
              <div className="text-center">
                <p className="text-lg font-medium text-gray-500 mb-4 animate-fade-in-up">
                  Upload your first contract to get started!
                </p>
                <button className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-6 rounded-full shadow-lg transform hover:scale-105 transition-transform duration-300 ease-in-out animate-fade-in-up">
                  Upload Contract
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Message Display */}
              <div className="flex-grow overflow-y-auto p-4 space-y-4" style={{ paddingBottom: '130px' }}>
                {chats[currentChat].map((msg, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-100 self-end' : 'bg-gray-100 self-start'}`}
                  >
                    <strong>{msg.role === 'user' ? 'You' : 'Bot'}:</strong> {msg.content}
                    <div className="text-xs text-gray-500 mt-1">{msg.timestamp}</div>
                  </div>
                ))}
              </div>

              {/* Document Load Section (Bottom) */}
              <div className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t shadow-md flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <label className="flex items-center cursor-pointer">
                    <AiOutlinePaperClip className="text-2xl text-gray-600 hover:text-blue-500 transition-all" />
                    <input type="file" className="hidden" onChange={handlePdfChange} />
                  </label>
                  {pdf && (
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-700">{pdf.name}</span>
                      <button onClick={removePdf}>
                        <FaTimes className="text-xl text-red-500" />
                      </button>
                    </div>
                  )}
                  <button
                    onClick={loadDoc}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded transition-all"
                  >
                    Load Document
                  </button>
                </div>
                {status && <div className="text-sm font-semibold text-gray-700">{status}</div>}

                {/* Input Section */}
                <div className="flex items-center space-x-2 w-full ml-4">
                  <input
                    type="text"
                    placeholder="Ask a question..."
                    className="flex-grow p-2 border border-gray-300 rounded focus:outline-none"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />
                  <button
                    onClick={submitQuery}
                    className="p-2 bg-blue-500 hover:bg-blue-400 text-white rounded transition-all"
                  >
                    <FiSend className="text-xl" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
