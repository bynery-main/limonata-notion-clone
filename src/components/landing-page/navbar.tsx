import React from 'react';
import { LogInIcon } from 'lucide-react'; // Adjust the import path as necessary
import { Button } from '../ui/button'; // Adjust the import path as necessary

const Navbar: React.FC = () => {
    const login = () => {
        // Define the login function logic here
    };

    return (
        <header className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-2">
                <LogInIcon className="h-6 w-6" />
                <span className="text-lg font-bold">
                    Limonata <span className="font-light">Project</span>
                </span>
            </div>
            <div className="space-x-4">
                <Button variant="ghost" onClick={login}>
                    LOG IN
                </Button>
                <Button variant="default" onClick={login}>
                    SIGN UP
                </Button>
            </div>
        </header>
    );
};

export default Navbar;