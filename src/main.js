import { createApp } from 'vue'
import App from './App.vue'

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDmh7yu-bKU7cyvMOHxWWYPuX7kccuJ5pU",
  authDomain: "daycounter-689b7.firebaseapp.com",
  projectId: "daycounter-689b7",
  storageBucket: "daycounter-689b7.appspot.com",
  messagingSenderId: "40260559408",
  appId: "1:40260559408:web:89a9166557480e52c803f5",
  measurementId: "G-D07CB1F109"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// eslint-disable-next-line
const analytics = getAnalytics(app);

createApp(App).mount('#app')
