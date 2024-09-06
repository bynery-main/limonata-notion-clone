import styled, { keyframes } from 'styled-components';



export const rotateAnimation = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;


export const RotatingCircle = styled.div`
  animation: ${rotateAnimation} 30s linear infinite;
  position: absolute;
  left: -100px;
  top: -200px;
  
  @media (max-width: 768px) {
    left: -150px;
    top: -250px;
    transform: scale(0.7);
  }
  
  @media (max-width: 480px) {
    left: -200px;
    top: -300px;
    transform: scale(0.5);
  }
`;