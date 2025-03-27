// Firebase 구성
const firebaseConfig = {
    apiKey: "AIzaSyDNc6JOcNRhIiqA15p1G620jzfzYNeP5lg",
    authDomain: "project-591930729518.firebaseapp.com",
    projectId: "project-591930729518",
    storageBucket: "project-591930729518.appspot.com",
    messagingSenderId: "591930729518",
    appId: "1:591930729518:web:glowroadad"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// Firebase 서비스 초기화
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Firebase 서비스 내보내기
window.auth = auth;
window.db = db;
window.storage = storage; 