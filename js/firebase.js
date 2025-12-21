import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBHUyLQSunTyiySlm3rOJTEmr_6Duq0DL4",
  authDomain: "fichascris-7d9e3.firebaseapp.com",
  databaseURL: 'https://fichascris-7d9e3-default-rtdb.firebaseio.com/',
  projectId: "fichascris-7d9e3",
  storageBucket: "fichascris-7d9e3.firebasestorage.app",
  messagingSenderId: "423225105004",
  appId: "1:423225105004:web:960dd22c4b58ec521a1649"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);