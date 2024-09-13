import { Button } from '@chakra-ui/react';
import React from 'react';

interface CostButtonProps {
    cost: string;
    className?: string;
}

const CostButton: React.FC<CostButtonProps> = ({ cost, className }) => {
    return (
        <Button className={`px-4 py-2 text-white bg-gradient-to-r from-green-500 to-blue-500 rounded-full ${className}`}>
            {cost}
        </Button>
    );
};

export default CostButton;