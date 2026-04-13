import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBtxzWGOEcal6t9slnOqvn8gJDYOY1L3zM",
  authDomain: "paralamourdemavie.firebaseapp.com",
  projectId: "paralamourdemavie",
  storageBucket: "paralamourdemavie.firebasestorage.app",
  messagingSenderId: "991550170522",
  appId: "1:991550170522:web:b8139be8cf6cbb2a250623",
  measurementId: "G-1DKX4T4BM7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function sendNotification() {
  try {
    const notifRef = collection(db, "notifications");
    await addDoc(notifRef, {
      title: "❤️ 4 Meses de Nós!",
      text: "Lembra que dia é hoje? Tem um negócio super importante pra você lá no aplicativo...",
      senderId: "system-auto-message-id",
      createdAt: serverTimestamp()
    });
    console.log("Notificação enviada via Firestore!");
    process.exit(0);
  } catch (error) {
    console.error("Erro ao enviar notificação: ", error);
    process.exit(1);
  }
}

sendNotification();
