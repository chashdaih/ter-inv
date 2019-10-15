// Firebase App (the core Firebase SDK) is always required and must be listed first
import firebase from "firebase/app";

// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/firestore";
import "firebase/functions";

// firebase init goes here
const config = {
	apiKey: process.env.VUE_APP_API_KEY,
    authDomain: "terinv-9ed4b.firebaseapp.com",
    databaseURL: "https://terinv-9ed4b.firebaseio.com",
    projectId: "terinv-9ed4b",
    storageBucket: "terinv-9ed4b.appspot.com",
    messagingSenderId: "426870880864",
    appId: "1:426870880864:web:88916ac78665c269dfa105"
}
firebase.initializeApp(config)

// firebase utils
const db = firebase.firestore()
const auth = firebase.auth()
const currentUser = auth.currentUser

// firebase collections
const usersCollection = db.collection('users'); // supervisores, estudiantes y terapeutas invitados
const patientsCollection = db.collection('patients');
const refersCollection = db.collection('refers');

export {
    firebase,
    db,
    auth,
    currentUser,
    usersCollection,
    patientsCollection,
    refersCollection,
}
