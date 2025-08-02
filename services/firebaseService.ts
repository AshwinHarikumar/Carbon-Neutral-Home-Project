
import { SurveyData } from '../types';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";

// Firebase configuration - replace with your project's config
const firebaseConfig = {
  apiKey: "AIzaSyDUCDW80NF_gBIJaAlYPipL7zWJdBBG-ck",
  authDomain: "nss-carbon-home.firebaseapp.com",
  projectId: "nss-carbon-home",
  storageBucket: "nss-carbon-home.firebasestorage.app",
  messagingSenderId: "887584515007",
  appId: "1:887584515007:web:0f524b95b759f2f228f70a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


// =================================================================
// AUTHENTICATION
// =================================================================

export const loginUser = (email: string, password: string): Promise<User> => {
    return signInWithEmailAndPassword(auth, email, password).then(userCredential => userCredential.user);
};

export const logoutUser = (): Promise<void> => {
    return signOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};


// =================================================================
// FIRESTORE DATABASE
// =================================================================

/**
 * Saves the survey data to the "surveys" collection in Firestore.
 * @param data The survey data to save.
 */
export const saveSurveyData = async (data: SurveyData): Promise<void> => {
    console.log("Attempting to save survey data...", data);

    const dataToSave = {
        ...data,
        submissionDate: new Date().toISOString()
    };

    try {
        const docRef = await addDoc(collection(db, "surveys"), dataToSave);
        console.log("Document written with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
        throw new Error("Failed to save data to Firebase.");
    }
};

/**
 * Fetches all survey data from Firestore.
 */
export const getSurveys = async (): Promise<SurveyData[]> => {
    console.log("Fetching all survey data from Firestore...");
    const querySnapshot = await getDocs(collection(db, "surveys"));
    const surveys: SurveyData[] = [];
    querySnapshot.forEach((doc) => {
        surveys.push({ id: doc.id, ...doc.data() } as SurveyData);
    });
    return surveys;
};

/**
 * Updates an existing survey in Firestore.
 * @param id The ID of the survey document to update.
 * @param data The partial or full survey data to update.
 */
export const updateSurvey = async (id: string, data: Partial<SurveyData>): Promise<void> => {
    console.log(`Updating survey ${id}...`, data);
    const surveyDocRef = doc(db, "surveys", id);
    try {
        await updateDoc(surveyDocRef, data);
        console.log("Survey updated successfully.");
    } catch (e) {
        console.error("Error updating document: ", e);
        throw new Error("Failed to update data in Firebase.");
    }
};