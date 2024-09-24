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
  const [currentChat, setCurrentChat] = useState(0); // To track the active chat
  const [chats, setChats] = useState([[]]); // Store multiple chat histories
  const [showSignup, setShowSignup] = useState(false); // Toggle between signup and login

  // Handle PDF upload
  const handlePdfChange = (e) => {
    setPdf(e.target.files[0]);
  };

  // Load PDF to backend for specific chat
  const loadDoc = async () => {
    const formData = new FormData();
    formData.append('pdf', pdf);

    try {
        const response = await axios.post(`http://localhost:5000/load_doc?chat_index=${currentChat}`, formData);
        setStatus(response.data);
        alert(response.data);
    } catch (error) {
        setStatus('Error loading document.');
    }
  };

  // Submit user query for specific chat
  const submitQuery = async () => {
    try {
        const response = await axios.post(`http://localhost:5000/answer_query?chat_index=${currentChat}`, { query: question });
        const newMessage = [
            { role: 'user', content: question },
            { role: 'bot', content: response.data },
        ];

        const updatedChats = [...chats];
        updatedChats[currentChat] = [...chats[currentChat], ...newMessage];
        setChats(updatedChats);

        setQuestion('');
    } catch (error) {
        const newMessage = [{ role: 'bot', content: 'Error answering query.' }];
        const updatedChats = [...chats];
        updatedChats[currentChat] = [...chats[currentChat], ...newMessage];
        setChats(updatedChats);
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
    <div className="flex">
      {/* Sidebar for Chat History */}
      <div className="w-1/4 bg-gray-200 p-4">
        <button onClick={handleNewChat} className="p-2 bg-blue-500 text-white rounded mb-4 w-full">
          New Chat
        </button>
        {chats.map((chat, index) => (
          <div
            key={index}
            onClick={() => handleSwitchChat(index)} // Call the switch function here
            className={`p-2 cursor-pointer ${index === currentChat ? 'bg-blue-300' : 'bg-white'}`}
          >
            Chat {index + 1}
          </div>
        ))}
      </div>

      {/* Main Chat Window */}
      <div className="w-3/4">
        <nav className="bg-blue-500 p-4 text-white">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">ContractLens - See Every Detail Clearly</h1>
            <div>
              {!user ? (
                <>
                  <button
                    onClick={handleGoogleLogin}
                    className="mr-4"
                  >
                    Login
                  </button>
                  <button onClick={() => setShowSignup(true)}>
                    Signup
                  </button>
                </>
              ) : (
                <button onClick={handleLogout} className="p-2 bg-red-500 text-white rounded">
                  Logout
                </button>
              )}
            </div>
          </div>
        </nav>

        <div className="container mx-auto p-4">
          {!user ? (
            <div className="flex justify-center mt-10">
              {showSignup && <SignupForm />}
            </div>
          ) : (
            <div>
              <div className="flex justify-between">
                <p>Welcome, {user.displayName}</p>
              </div>

              {/* Message Display */}
              <div className="flex-grow overflow-auto p-4" style={{ paddingBottom: '130px' }}>
                <div className="space-y-4">
                  {chats[currentChat].map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'bot' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`p-3 rounded-lg ${msg.role === 'bot' ? 'bg-gray-200' : 'bg-blue-500 text-white'}`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PDF Status Section */}
              {pdf && (
                <div className="fixed bottom-16 left-0 right-0 bg-gray-200 p-2 flex items-center border-t border-gray-300">
                  <span className="flex-grow text-gray-700">{pdf.name}</span>
                  <FaTimes className="text-red-500 cursor-pointer" onClick={removePdf} />
                </div>
              )}

              {/* Input Bar */}
              <div className="fixed bottom-0 left-0 right-0 bg-gray-100 p-4 flex items-center border-t border-gray-300">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
