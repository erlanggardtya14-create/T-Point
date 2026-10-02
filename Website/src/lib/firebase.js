import { initializeApp } from "firebase/app";
import {
    getDatabase,
    ref,
    get,
    set,
    push,
    runTransaction,
    onValue,
} from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBK916Rv8lszq-bdNHRME8XUl_P158xJiI",
    authDomain: "trash-point-d00f2.firebaseapp.com",
    databaseURL: "https://trash-point-d00f2-default-rtdb.firebaseio.com",
    projectId: "trash-point-d00f2",
    storageBucket: "trash-point-d00f2.firebasestorage.app",
    messagingSenderId: "999885319126",
    appId: "1:999885319126:web:da199dbfd98fb7e57d9277",
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
export const auth = getAuth(app);
export const storage = getStorage(app);