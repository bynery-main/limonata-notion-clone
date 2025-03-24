import React from 'react';
import styled from 'styled-components';
import './PrimaryButton.scss';

const StyledButton = styled.button`
  background: #FF8DC7;
  color: white;
  padding: 0.5rem 2rem;
  border-radius: 0.5rem;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  border: 2px solid #FF8DC7;
  transition: all 0.3s ease;
  
  &:hover {
    background: transparent;
    color: #FF8DC7;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 141, 199, 0.3);
  }
`;

interface GradientButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const GradientButton: React.FC<GradientButtonProps> = ({ 
  onClick, 
  children,
  className = ''
}) => {
  return (
    <StyledButton 
      onClick={onClick} 
      className={`upgrade-section__button ${className}`}
    >
      {children}
    </StyledButton>
  );
};

export const OutlineButton = styled.button`
  background: transparent;
  color: #374151;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  border: 2px solid #E5E7EB;
  transition: all 0.2s ease;

  &:hover {
    background: #F3F4F6;
  }
`; 