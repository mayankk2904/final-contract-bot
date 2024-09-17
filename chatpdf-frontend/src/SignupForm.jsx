// SignupForm.js

import { useState } from 'react';
import axios from 'axios';

function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSignup = async () => {
    try {
      const response = await axios.post('http://localhost:5000/signup', {
        email,
        password
      });
      setMessage(response.data);
    } catch (error) {
      setMessage('Signup failed. Please try again.');
    }
  };

  return (
    <div>
      <input 
        type="email" 
        placeholder="Email" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="p-2 border border-gray-300 rounded mb-2"
      />
      <input 
        type="password" 
        placeholder="Password" 
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="p-2 border border-gray-300 rounded mb-2"
      />
      <button onClick={handleSignup} className="p-2 bg-green-500 text-white rounded">
        Sign Up
      </button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default SignupForm;
