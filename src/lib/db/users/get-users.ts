import { db } from "../../../firebase/firebaseConfig";
import { getDocs, collection, query} from "firebase/firestore";

export interface Users {
  uid: string;
  email: string;
}

export const fetchUsers = async (): Promise<Users[]> => {
  const usersQuery = query(
    collection(db, "users")
  );
  const usersSnapshot = await getDocs(usersQuery);

  return usersSnapshot.docs.map((doc) => ({
    uid: doc.id,
    email: doc.data().name,
  }));
};