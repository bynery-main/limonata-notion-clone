import React from 'react';
import { LogInIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/components/auth-provider/AuthProvider";
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase/firebaseConfig'; // Adjust this import based on your firebase setup
import logo from './Images/Black_Logo@4x.png';
import styled, { keyframes } from 'styled-components';

const gradientAnimation = keyframes`
0% {
    background-position: 0% 50%;
}
50% {
    background-position: 100% 50%;
}
100% {
    background-position: 0% 50%;
}
`;

const AnimatedButton = styled(Button)`
    background: linear-gradient(-45deg, #FE7EF4, #F6B144);
background-size: 400% 400%;
animation: ${gradientAnimation} 15s ease infinite;
border: none;
color: white;
font-weight: bold;

&:hover {
    opacity: 0.9;
}

&:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}
`;

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
        <header className="flex items-center justify-between p-10 relative z-20">
            <div className="flex items-center space-x-2">
                <span className="text-lg font-bold">
                    <img src={logo.src} alt="Limonata" style={{ width: '15vw' }} />
                </span>
            </div>
            <div className="space-x-4">
                {!loading && (
                    user ? (
                        <AnimatedButton variant="default" onClick={handleSignOut}>
                            SIGN OUT
                        </AnimatedButton>
                    ) : (
                        <>
                            <AnimatedButton variant="ghost" onClick={handleLogin}>
                                LOG IN
                            </AnimatedButton>
                            <AnimatedButton variant="default" onClick={handleSignUp}>
                                SIGN UP
                            </AnimatedButton>
                        </>
                    )
                )}
            </div>
        </header>
    );
};

export default Navbar;
