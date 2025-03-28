// Firebase 구성
const firebaseConfig = {
    apiKey: "AIzaSyDNc6JOcNRhIiqA15p1G620jzfzYNeP5lg",
    authDomain: "glowroadad.firebaseapp.com",
    projectId: "glowroadad",
    storageBucket: "glowroadad.appspot.com",
    messagingSenderId: "591930729518",
    appId: "1:591930729518:web:5531dbdbce142ce86f2bbf",
    measurementId: "G-PX3RYSX2LN"
};

// Firebase 초기화
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Storage 초기화 및 설정
const storage = firebase.storage();
const firestore = firebase.firestore();

// Storage 설정
const storageRef = storage.ref();

// 전역 객체에 할당
window.firebaseConfig = firebaseConfig;
window.storage = storage;
window.firestore = firestore;
window.storageRef = storageRef; 