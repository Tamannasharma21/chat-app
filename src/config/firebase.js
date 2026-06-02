import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { toast } from "react-toastify";

const firebaseConfig = {
  apiKey: "AIzaSyAu7p42onlsgan5Mpp5Z6Jgs3oBvRsCN-8",
  authDomain: "chat-app-a5679.firebaseapp.com",
  projectId: "chat-app-a5679",
  storageBucket: "chat-app-a5679.firebasestorage.app",
  messagingSenderId: "561068604135",
  appId: "1:561068604135:web:7e4a9faef7838ca9ca0042",
  measurementId: "G-YQYXYZCQY2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signup = async (username, email, password) => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username.toLowerCase()));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.docs.length > 0) {
      toast.error("Username already taken");
      return;
    }
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      username: username.toLowerCase(),
      email,
      name: "",
      avatar: "",
      bio: "Hey, I am using Chat App",
      lastSeen: Date.now(),
    });
    await setDoc(doc(db, "chats", user.uid), {
      chatsData: [],
    });
  } catch (error) {
    console.error(error);
    toast.error(error.message || "Something went wrong");
  }
};

const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error(error);
    toast.error(error.code.split("/")[1].split("-").join(" "));
  }
};

const logout = async () => {
  await signOut(auth);
};

const resetPass = async (email) => {
  if (!email) {
    toast.error("Enter your email first");
    return;
  }
  try {
    const userRef = collection(db, "users");
    const q = query(userRef, where("email", "==", email));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      await sendPasswordResetEmail(auth, email);
      toast.success("Reset email sent!");
    } else {
      toast.error("Email not found");
    }
  } catch (error) {
    console.error(error);
    toast.error(error.message);
  }
};

export { auth, db, login, signup, logout, resetPass };
