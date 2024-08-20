// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAK_vmxGnkU28lNLRnI7OFoqyqE0phc7KQ",
    authDomain: "podify-web.firebaseapp.com",
    projectId: "podify-web",
    storageBucket: "podify-web.appspot.com",
    messagingSenderId: "337323132007",
    appId: "1:337323132007:web:59ba3220a5ca5b2eb680c2",
    measurementId: "G-RPL3CPSWYZ"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);