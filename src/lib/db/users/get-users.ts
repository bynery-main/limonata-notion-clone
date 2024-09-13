import { db } from "../../../firebase/firebaseConfig";
import { getDocs, getDoc, collection, query, doc } from "firebase/firestore";

export interface User {
  uid: string;
  email: string;
  photoURL: string;
}

// Function to fetch all users
export const fetchUsers = async (): Promise<User[]> => {
  const usersQuery = query(
    collection(db, "users")
  );
  const usersSnapshot = await getDocs(usersQuery);
  return usersSnapshot.docs.map((doc) => ({
    uid: doc.id,
    email: doc.data().email,
    photoURL: doc.data().photoURL || '', // Add photoURL, use empty string as fallback
  }));
};

// Function to fetch a single user's data by their UID
export const fetchUserById = async (uid: string): Promise<User> => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const data = userSnap.data();
    return {
      uid: userSnap.id,
      email: data.email,
      photoURL: data.photoURL || '', // Add photoURL, use empty string as fallback
    };
  } else {
    throw new Error("User not found");
  }
};

// Function to fetch a single user's email by their UID (kept for backwards compatibility)
export const fetchUserEmailById = async (uid: string): Promise<string> => {
  const user = await fetchUserById(uid);
  return user.email;
};