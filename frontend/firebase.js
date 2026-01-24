import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDp93uoW3bR3sBHGGIQR0QAwt8H5jIyCe0",
  authDomain: "kasturi-masale.firebaseapp.com",
  projectId: "kasturi-masale",
  storageBucket: "kasturi-masale.firebasestorage.app",
  messagingSenderId: "790130392562",
  appId: "1:790130392562:web:bcf2befc4187e8fd2eff6b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
