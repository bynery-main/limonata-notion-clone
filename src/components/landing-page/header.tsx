'use client';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import Logo from '../../../public/cypresslogo.svg'; 
import { auth } from '@/firebase/firebaseConfig';
import { Grid, Navigation } from 'lucide-react';
import { deleteUser, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuIndicator,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
    NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

const routes = [
    { title: 'Features', href: '#features' },
    { title: 'Resources', href: '#resources' },
    { title: 'Pricing', href: '#pricing' },
    { title: 'Settings', href: '#settings' },
];

const components: { title: string; href: string; description: string }[] = [
    {
        title: 'Alert Dialog',
        href: '#',
        description:
            'A modal dialog that interrupts the user with important content and expects a response.',
    },
    {
        title: 'Hover Card',
        href: '#',
        description:
            'For sighted users to preview content available behind a link.',
    },
    {
        title: 'Progress',
        href: '#',
        description:
            'Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.',
    },
    {
        title: 'Scroll-area',
        href: '#',
        description: 'Visually or semantically separates content.',
    },
    {
        title: 'Tabs',
        href: '#',
        description:
            'A set of layered sections of content—known as tab panels—that are displayed one at a time.',
    },
    {
        title: 'Tooltip',
        href: '#',
        description:
            'A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.',
    },
];

const Header = () => {
    const [path, setPath] = useState('#products');

    const handleDeleteAccount = async () => {
        if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            const user = auth.currentUser;

            if (user) {
                try {
                    await deleteUser(user);
                    alert("Account deleted successfully.");
                    window.location.href = "/login";
                } catch (error: any) {
                    console.error("Error deleting account:", error);
                    if (error.code === 'auth/requires-recent-login') {
                        alert("You need to reauthenticate before deleting your account. Please log in again.");
                        const credential = EmailAuthProvider.credential(
                            user.email!,
                            prompt('Please enter your password again:')!
                        );
                        try {
                            await reauthenticateWithCredential(user, credential);
                            handleDeleteAccount(); // Retry account deletion after reauthentication
                        } catch (reauthError: any) {
                            alert("Reauthentication failed: " + reauthError.message);
                        }
                    } else {
                        alert("Error deleting account: " + error.message);
                    }
                }
            }
        }
    };

    return (
        <header className="p-4 flex justify-center items-center">
            <Link href={'/'} className='w-full flex gap-2 justify-left items-center'>
                <Image src={Logo} alt='Cypress Logo' width={25} height={25} />
                <span className='font-semibold dark:text-white'> cypress.</span>
            </Link>
            <NavigationMenu className='hidden md:block'>
                <NavigationMenuList className='gap-6'>
                    <NavigationMenuItem>
                        <NavigationMenuTrigger onClick={() => setPath('#resources')} className={cn({
                            'dark:text-white': path === '#resources',
                            'dark:text-white/40': path !== '#resources',
                            'font-normal': true,
                            'text-xl': true,
                        })}>
                            Resources
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <ul className='grid gap-3 p-6 md:w-[400px] lg:[500px] lg:grid-cols-[.75fr_1fr]'>
                                <li className="row-span-3">
                                    <span className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md">
                                        Trial {/* Change this for Navigation bar content */}
                                    </span>
                                </li>
                                <ListItem href="#" title="Introduction">
                                    Re-usable components built using Radix UI and Tailwind CSS.
                                </ListItem>
                                <ListItem href="#" title="Installation">
                                    How to install dependencies and structure your app.
                                </ListItem>
                                <ListItem href="#" title="Typography">
                                    Styles for headings, paragraphs, lists...etc
                                </ListItem>
                            </ul>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuTrigger onClick={() => setPath('#pricing')} className={cn({
                            'dark:text-white': path === '#pricing',
                            'dark:text-white/40': path !== '#pricing',
                            'font-normal': true,
                            'text-xl': true,
                        })}>
                            Pricing
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <ul className="grid w-[400px] gap-3 p-4 md:grid-row-2">
                                <ListItem title="Pro Plan" href="#">
                                    Unlock full power with collaboration.
                                </ListItem>
                                <ListItem title="Free Plan" href="#">
                                    Great for teams just starting out.
                                </ListItem>
                            </ul>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <NavigationMenuContent>
                            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                                {components.map((component) => (
                                    <ListItem key={component.title} title={component.title} href={component.href}>
                                        {component.description}
                                    </ListItem>
                                ))}
                            </ul>
                        </NavigationMenuContent>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                        <Link href={'#'}>
                            <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), {
                                'dark:text-white': path === '#settings',
                                'dark:text-white/40': path !== '#settings',
                                'font-normal': true,
                                'text-xl': true,
                            })}>
                                Settings
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
            <aside className="flex w-full gap-2 justify-end">
                <Link href={'/logout'}>
                    <button 
                        className="p-[1px] relative block hidden sm:block"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#F6B144] to-[#FE7EF4] rounded-full" />
                        <div className="px-4 py-2 relative bg-white rounded-full group transition duration-200 text-xs sm:text-sm text-black hover:bg-transparent hover:text-white flex items-center justify-center font-semibold">
                            Sign Out
                        </div>
                    </button>
                </Link>
                <button 
                    onClick={handleDeleteAccount} 
                    className="p-[1px] relative block"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#C66EC5] to-[#FC608D] rounded-full" />
                    <div className="px-4 py-2 relative bg-white rounded-full group transition duration-200 text-xs sm:text-sm text-black hover:bg-transparent hover:text-white flex items-center justify-center font-semibold whitespace-nowrap">
                        Delete Account
                    </div>
                </button>
            </aside>
        </header>
    );
};

const ListItem = React.forwardRef<
    React.ElementRef<'a'>,
    React.ComponentPropsWithoutRef<'a'>
>(({ className, title, children, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        'group block select-none space-y-1 font-medium leading-none'
                    )}
                    {...props}
                >
                    <div className="text-white text-sm font-medium leading-none">
                        {title}
                    </div>
                    <div className="group-hover:text-white/70 line-clamp-2 text-sm leading-snug text-white/40">
                        {children}
                    </div>
                </a>
            </NavigationMenuLink>
        </li>
    );
});

ListItem.displayName = 'ListItem';

export { Header, ListItem };
