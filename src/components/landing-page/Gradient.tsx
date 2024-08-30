import React from 'react';
import styled from 'styled-components';

const GradientBlob = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    #FF00FF 0%,
    #FBED21 25%,
    #F6921E 50%,
    #FBED21 75%,
    #FF00FF 100%
  );
  mask-image: radial-gradient(
    circle at center,
    black 0%,
    black 30%
  );
  filter: blur(50px);
  opacity: 0.8;
  z-index: -1;
`;

const BackgroundWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

interface GradientBlobBackgroundProps {
  children?: React.ReactNode;
}

const GradientBlobBackground: React.FC<GradientBlobBackgroundProps> = ({ children }) => {
  return (
    <BackgroundWrapper>
      <GradientBlob />
      {children}
    </BackgroundWrapper>
  );
};

export default GradientBlobBackground;