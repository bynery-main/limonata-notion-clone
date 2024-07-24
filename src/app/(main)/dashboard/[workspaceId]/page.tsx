import React from "react";
import { auth } from '@/firebase/firebaseConfig';
import { deleteUser, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

const Page = () => {
    const handleDeleteAccount = () => {
        if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            const user = auth.currentUser;

            if (user) {
                deleteUser(user).then(() => {
                    alert("Account deleted successfully.");
                    // Redirect the user to the login page after account deletion
                    window.location.href = "/login";
                }).catch(async (error: { code: string; message: string; }) => {
                    console.error("Error deleting account:", error);
                    if (error.code === 'auth/requires-recent-login') {
                        alert("You need to reauthenticate before deleting your account. Please log in again.");
                        // Example: Re-authenticate user
                        const credential = EmailAuthProvider.credential(
                            user.email!,
                            prompt('Please enter your password again:')!
                        );
                        await reauthenticateWithCredential(user, credential);
                        handleDeleteAccount();
                    } else {
                        alert("Error deleting account: " + error.message);
                    }
                });
            }
        }
    };

    return (
        <div>
            <h1>Workspace Page</h1>
            <button onClick={handleDeleteAccount}>Delete Account</button>
        </div>
    );
};

export default Page;
