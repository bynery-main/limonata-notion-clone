import React, { useEffect, useState } from 'react';
import { Menu, X, User, Home, MessageCircle } from 'lucide-react';
import { GradientButton } from '../PrimaryButton/PrimaryButton';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from "@/components/auth-provider/AuthProvider";
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase/firebaseConfig';
import Image from 'next/image';
import logo from '/public/Images/Black_Logo@4x.png';
import styled, { keyframes } from 'styled-components';
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

const AnimatedButton = styled(GradientButton)`
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
  font-size: 16px;
  color: #1d1d1f;
  transition: color 0.2s ease;
  font-weight: 400;

  &:hover {
    color: #666;
  }
`;

const ProfilePicContainer = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  margin-left: 1rem;
  cursor: pointer;
  background: #f5f5f7;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }
`;

const ProfilePicImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Navbar = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { user, loading } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [shouldScrollToFeatures, setShouldScrollToFeatures] = useState(false);


    const handleLogin = () => {
        router.push('/login');
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


    useEffect(() => {
        if (shouldScrollToFeatures && pathname === '/') {
            const featuresSection = document.getElementById('features-section');
            if (featuresSection) {
                featuresSection.scrollIntoView({ behavior: 'smooth' });
            }
            setShouldScrollToFeatures(false);
        }
    }, [pathname, shouldScrollToFeatures]);

    const navItems = [
        {
            name: "Home",
            link: "/",
            icon: <Home className="h-4 w-4 text-neutral-500 dark:text-white" />,
        },
        {
            name: "AI Features",
            link: "/#features-section",
            icon: <MessageCircle className="h-4 w-4 text-neutral-500 dark:text-white" />,
        },
        {
            name: "Pricing",
            link: "/pricing",
            icon: <User className="h-4 w-4 text-neutral-500 dark:text-white" />,
        },
        {
            name: "Contact",
            link: "/contact",
            icon: <MessageCircle className="h-4 w-4 text-neutral-500 dark:text-white" />,
        },
    ];

    const isActive = (path: string | null) => {
        if (path === "/#features-section") {
            return false;
        }
        return pathname === path;
    };


    return (
        <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200/50 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex-shrink-0">
                        <Link href="/">
                            <Image src={logo} alt="Limonata" width={100} height={30} className="h-7 w-auto" />
                        </Link>
                    </div>
                    
                    <div className="-mr-2 -my-2 md:hidden">
                        <GradientButton onClick={toggleMenu} className="text-gray-700">
                            <span className="sr-only">Open menu</span>
                            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </GradientButton>
                    </div>

                    <nav className="hidden md:flex space-x-8">
                        {navItems.map((item, index) => (
                            <NavItem
                                key={index}
                                as={Link}
                                href={item.link}
                                className={isActive(item.link) ? "text-black font-medium" : ""}
                            >
                                {item.name}
                            </NavItem>
                        ))}
                    </nav>

                    <div className="hidden md:flex items-center space-x-4">
                        {!loading && (
                            user ? (
                                <>
                                    <button onClick={handleSignOut} 
                                        className="text-sm text-gray-700 hover:text-gray-900 transition-colors">
                                        Sign Out
                                    </button>
                                    <ProfilePicContainer onClick={() => router.push('/settings')}>
                                        {user.photoURL ? (
                                            <ProfilePicImage src={user.photoURL} alt="Profile" />
                                        ) : (
                                            <User size={20} className="text-gray-600" />
                                        )}
                                    </ProfilePicContainer>
                                </>
                            ) : (
                                <button onClick={handleLogin} 
                                    className="text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors">
                                    Sign In
                                </button>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile menu - with updated styling */}
            <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden fixed inset-0 z-50`}>
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={toggleMenu}></div>
                <div className="absolute right-0 top-0 h-full w-64 bg-white/95 shadow-lg p-6">
                    <div className="flex justify-end mb-6">
                        <GradientButton onClick={toggleMenu} className="text-gray-700">
                            <X className="h-5 w-5" />
                        </GradientButton>
                    </div>
                    <div className="flex flex-col space-y-4">
                        {navItems.map((item, index) => (
                            <NavItem
                                key={index}
                                as={Link}
                                href={item.link}
                                onClick={toggleMenu}
                                className="text-gray-900"
                            >
                                {item.name}
                            </NavItem>
                        ))}
                        {user ? (
                            <button onClick={handleSignOut} 
                                className="text-sm text-gray-700 hover:text-gray-900 transition-colors pt-4">
                                Sign Out
                            </button>
                        ) : (
                            <button onClick={handleLogin} 
                                className="text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors pt-4">
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;