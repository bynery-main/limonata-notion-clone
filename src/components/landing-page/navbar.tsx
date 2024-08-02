import React from 'react';
import { LogInIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/components/auth-provider/AuthProvider";
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase/firebaseConfig'; // Adjust this import based on your firebase setup

const Navbar = () => {
    const router = useRouter();
    const { user, loading } = useAuth();

    const handleLogin = () => {
        router.push('/login');
    };

    const handleSignUp = () => {
        router.push('/sign-up');
    };

    const handleSignOut = () => {
        signOut(auth);
        router.push('/login');
    };

    return (
        <header className="flex items-center justify-between p-6 relative z-20">
            <div className="flex items-center space-x-2">
                <LogInIcon className="h-6 w-6" />
                <span className="text-lg font-bold">
                    Limonata <span className="font-light">Project</span>
                </span>
            </div>
            <div className="space-x-4">
                {!loading && (
                    user ? (
                        <Button variant="default" onClick={handleSignOut}>
                            SIGN OUT
                        </Button>
                    ) : (
                        <>
                            <Button variant="ghost" onClick={handleLogin}>
                                LOG IN
                            </Button>
                            <Button variant="default" onClick={handleSignUp}>
                                SIGN UP
                            </Button>
                        </>
                    )
                )}
            </div>
        </header>
    );
};

export default Navbar;
