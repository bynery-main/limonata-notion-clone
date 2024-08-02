import { db } from "../../../firebase/firebaseConfig";
import { getDocs, getDoc, collection, query, doc } from "firebase/firestore";

export interface Users {
  uid: string;
  email: string;
}

// Function to fetch all users
export const fetchUsers = async (): Promise<Users[]> => {
  const usersQuery = query(
    collection(db, "users")
  );
  const usersSnapshot = await getDocs(usersQuery);

  return usersSnapshot.docs.map((doc) => ({
    uid: doc.id,
    email: doc.data().email,
  }));
};

// Function to fetch a single user's email by their UID
export const fetchUserEmailById = async (uid: string): Promise<string> => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const data = userSnap.data();
    return data.email;
  } else {
    throw new Error("User not found");
  }
};
