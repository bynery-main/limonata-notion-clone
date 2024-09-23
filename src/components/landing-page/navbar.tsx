import React, { useState } from 'react';
import { Menu, X, User } from 'lucide-react';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/components/auth-provider/AuthProvider";
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase/firebaseConfig';
import Image from 'next/image';
import logo from '../../../public/Images/Black_Logo@4x.png';
import styled, { keyframes } from 'styled-components';
import NavbarAuthButton from '../ui/bm-button';
import Link from 'next/link';

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

const NavItem = styled.a`
  cursor: pointer;
  padding: 0.5rem 1rem;
  transition: background 0.3s ease;

  &:hover {
    background: linear-gradient(to right, #FE7EF4, #F6B144);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const ProfilePicContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-left: 1rem;
  cursor: pointer;
  background: linear-gradient(to right, #FE7EF4, #F6B144);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ProfilePicImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Navbar = () => {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogin = () => {
        router.push('/login');
        setIsMenuOpen(false);
    };

    const handleSignUp = () => {
        router.push('/sign-up');
        setIsMenuOpen(false);
    };

    const handleSignOut = () => {
        signOut(auth);
        router.push('/login');
        setIsMenuOpen(false);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const scrollToFeatures = () => {
        const featuresSection = document.getElementById('features-section');
        if (featuresSection) {
            featuresSection.scrollIntoView({ behavior: 'smooth' });
        }
        setIsMenuOpen(false);
    };

    return (
        <header className="relative z-20 my-3 mx-8">
            <div className="max-w-7xl px-8 sm:px-30 lg:px-30 min-w-[95vw]">
                <div className="flex justify-between items-center py-2 md:justify-start md:space-x-10">
                    <div className="flex justify-start lg:w-0 lg:flex-1">
                        <span className="sr-only">Limonata</span>
                        <Image src={logo} alt="Limonata" width={150} height={50} className="h-[7vw] w-auto mx-45 sm:h-10" />
                    </div>
                    <div className="-mr-2 -my-2 md:hidden">
                        <Button variant="ghost" onClick={toggleMenu}>
                            <span className="sr-only">Open menu</span>
                            {isMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
                        </Button>
                    </div>
                    <nav className="hidden md:flex space-x-10">
                        <NavItem as={Link} href="/pricing">Pricing</NavItem>
                        <NavItem as={Link} href="/contact">Contact</NavItem>
                        <NavItem onClick={scrollToFeatures}>AI Features</NavItem>
                    </nav>
                    <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
                        {!loading && (
                            user ? (
                                <>
                                    <NavbarAuthButton onClick={handleSignOut}>
                                        SIGN OUT
                                    </NavbarAuthButton>
                                    <ProfilePicContainer>
                                        {user.photoURL ? (
                                            <ProfilePicImage src={user.photoURL} alt="Profile" />
                                        ) : (
                                            <User size={24} color="#fff" />
                                        )}
                                    </ProfilePicContainer>
                                </>
                            ) : (
                                <>
                                    <NavbarAuthButton onClick={handleLogin}>
                                        LOG IN
                                    </NavbarAuthButton>
                                    <AnimatedButton variant="default" onClick={handleSignUp}>
                                        SIGN UP
                                    </AnimatedButton>
                                </>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile menu, show/hide based on menu state */}
            <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    <NavItem as={Link} href="/pricing" className="block">Pricing</NavItem>
                    <NavItem as={Link} href="/contact" className="block">Contact</NavItem>
                    <NavItem onClick={scrollToFeatures} className="block">AI Features</NavItem>
                    {!loading && (
                        user ? (
                            <>
                                <AnimatedButton variant="default" onClick={handleSignOut} className="w-full">
                                    SIGN OUT
                                </AnimatedButton>
                                <ProfilePicContainer className="mx-auto mt-4">
                                    {user.photoURL ? (
                                        <ProfilePicImage src={user.photoURL} alt="Profile" />
                                    ) : (
                                        <User size={24} color="#fff" />
                                    )}
                                </ProfilePicContainer>
                            </>
                        ) : (
                            <>
                                <AnimatedButton variant="ghost" onClick={handleLogin} className="w-full mb-2">
                                    LOG IN
                                </AnimatedButton>
                                <AnimatedButton variant="default" onClick={handleSignUp} className="w-full">
                                    SIGN UP
                                </AnimatedButton>
                            </>
                        )
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;