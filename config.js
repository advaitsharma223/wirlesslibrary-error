import { firebase } from '@firebase/app';
require("@firebase/firestore");
var firebaseConfig = {
    apiKey: "AIzaSyD2Tl3sqn40s-munwXFaTqu-rik8X0dYJE",
    authDomain: "wily-4dbdb.firebaseapp.com",
    projectId: "wily-4dbdb",
    storageBucket: "wily-4dbdb.appspot.com",
    messagingSenderId: "987735506004",
    appId: "1:987735506004:web:93cf0d9a76c8d2270701c1"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

export default firebase.firestore();