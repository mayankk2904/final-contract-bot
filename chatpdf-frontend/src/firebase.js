import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAUi0hL6cKqxjOp1qv4KvAxBDMjYJ486fo",
  authDomain: "contract-chatbot-9d881.firebaseapp.com",
  projectId: "contract-chatbot-9d881",
  storageBucket: "contract-chatbot-9d881.appspot.com",
  messagingSenderId: "120237478234",
  appId: "1:120237478234:web:9893d78c59e8b701c7a363",
  measurementId: "G-5TYVBN6SN3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, signOut };
