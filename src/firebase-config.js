import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD-JZxTufgkVtY_JjEs9RaQzRyhUQz8ICA",
  authDomain: "dns-manager-7bfc9.firebaseapp.com",
  projectId: "dns-manager-7bfc9",
  storageBucket: "dns-manager-7bfc9.appspot.com",
  messagingSenderId: "245981787285",
  appId: "1:245981787285:web:bd65167a7c234457ba179c",
  measurementId: "G-G4QX4YJPT2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export default app;
