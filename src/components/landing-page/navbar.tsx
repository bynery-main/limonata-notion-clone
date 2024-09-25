import React, { useEffect, useState } from 'react';
import { Menu, X, User, Home, MessageCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from "@/components/auth-provider/AuthProvider";
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase/firebaseConfig';
import Image from 'next/image';
import logo from '../../../public/Images/Black_Logo@4x.png';
import styled, { keyframes } from 'styled-components';
import NavbarAuthButton from '../ui/bm-button';
import Link from 'next/link';
import { FloatingNav } from '../ui/floating-navbar';

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
    const pathname = usePathname();
    const { user, loading } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [shouldScrollToFeatures, setShouldScrollToFeatures] = useState(false);


    const handleLogin = () => {
        router.push('/login');
        setIsMenuOpen(false);
    };

  /*  const handleSignUp = () => {
        router.push('/sign-up');
        setIsMenuOpen(false);
    };
*/
    const handleSignOut = () => {
        signOut(auth);
        router.push('/login');
        setIsMenuOpen(false);
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const scrollToFeatures = () => {
        if (pathname !== '/') {
            router.push('/');
            setShouldScrollToFeatures(true);
        } else {
            const featuresSection = document.getElementById('features-section');
            if (featuresSection) {
                featuresSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
        setIsMenuOpen(false);
    };
    const handleLogoClick = () => {
        router.push('/');
    }

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
        <>
            <FloatingNav 
                navItems={navItems} 
                user={user} 
                onLogin={handleLogin} 
                onLogout={handleSignOut}
            />
            <header className="relative z-20 my-3 mx-8 mb-5">
                <div className="max-w-7xl px-8 sm:px-30 lg:px-30 min-w-[95vw]">
                    <div className="flex justify-between items-center py-2 md:justify-start md:space-x-10">
                        <div className="flex justify-start lg:w-0 lg:flex-1">
                            <Link href="/">
                                <Image src={logo} alt="Limonata" width={150} height={50} className="h-[7vw] w-auto mx-45 sm:h-10" />
                            </Link>
                        </div>
                        <div className="-mr-2 -my-2 md:hidden">
                            <Button variant="ghost" onClick={toggleMenu}>
                                <span className="sr-only">Open menu</span>
                                {isMenuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
                            </Button>
                        </div>
                        <nav className="hidden md:flex space-x-10">
                            {navItems.map((item, index) => (
                                 <NavItem
                                 key={index}
                                 as={Link}
                                 href={item.link}
                                 className={isActive(item.link) ? "text-transparent bg-clip-text bg-gradient-to-r from-[#FE7EF4] to-[#F6B144]" : ""}
                             >
                                    {item.name}
                                </NavItem>
                            ))}
                        </nav>
                        <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
                            {!loading && (
                                user ? (
                                    <>
                                       <button onClick={handleSignOut} className="p-[1px] relative block">
                                        <div className="absolute inset-0 bg-gradient-to-r from-[#F6B144] to-[#FE7EF4] rounded-full" />
                                        <div className="px-3 py-2 relative bg-white rounded-full group transition duration-200 text-sm text-black hover:bg-transparent hover:text-white">
                                            Sign Out
                                        </div>
                                        </button>
                                        <ProfilePicContainer onClick={() => router.push('/settings')}>
                                            {user.photoURL ? (
                                                <ProfilePicImage src={user.photoURL} alt="Profile" />
                                            ) : (
                                                <User size={24} color="#fff" />
                                            )}
                                        </ProfilePicContainer>
                                    </>
                                ) : (
                                    <>
                                    <button onClick={handleLogin} className="p-[1px] relative block">
                                        <div className="absolute inset-0 bg-gradient-to-r from-[#F6B144] to-[#FE7EF4] rounded-full" />
                                        <div className="px-3 py-2 relative bg-white rounded-full group transition duration-200 text-sm text-black hover:bg-transparent hover:text-white">
                                            <div className="flex items-center whitespace-nowrap">
                                            Log In
                                            </div>
                                        </div>
                                        </button>
                                        {/* 
                                        <AnimatedButton onClick={handleSignUp}>
                                            SIGN UP
                                        </AnimatedButton>
                                        */}
                                    </>
                                )
                            )}
                        </div>
                    </div>
                </div>

                           {/* Mobile menu */}
                           <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden fixed inset-0 z-50`}>
                    <div className="absolute inset-0 bg-white bg-opacity-75 backdrop-blur-sm" onClick={toggleMenu}></div>
                    <div className="absolute right-0 top-0 h-full w-64 bg-white shadow-xl flex flex-col items-end p-4">
                        <Button variant="ghost" onClick={toggleMenu} className="self-end mb-4">
                            <X className="h-6 w-6" aria-hidden="true" />
                        </Button>
                        {navItems.map((item, index) => (
                                               <NavItem
                                               key={index}
                                               as={Link}
                                               href={item.link}
                                               onClick={toggleMenu}
                                               className={`block mb-2 ${
                                                   isActive(item.link) ? "text-transparent bg-clip-text bg-gradient-to-r from-[#FE7EF4] to-[#F6B144]" : ""
                                               }`}
                                           >
                                {item.name}
                            </NavItem>
                        ))}
                </div>
            </div>
        </header>
        </>
    );
};

export default Navbar;