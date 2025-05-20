// firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDPBkV6k0SeW29eGXdiVkBA4nYJFnaM1JI",
  authDomain: "social-network-ba7f1.firebaseapp.com",
  projectId: "social-network-ba7f1",
  storageBucket: "social-network-ba7f1.firebasestorage.app",
  messagingSenderId: "588659170059",
  appId: "1:588659170059:web:4ddc592c06d8e557e4600e",
  measurementId: "G-EKJWMWN3Y4",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export { auth, googleProvider, githubProvider };
