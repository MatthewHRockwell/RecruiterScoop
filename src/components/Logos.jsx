import React from 'react';
import headerLogoIcon from '../assets/Man_Silhoutte_Down_V2.svg';
import LandingLogoIcon from '../assets/eView_Silhoutte_V2.svg';
import FooterLogoIcon from '../assets/eView_Silhoutte_Captioned_Inverted.svg';

export const HeaderLogo = ({ className = "h-10 w-auto", onClick }) => (
  <div onClick={onClick} className="cursor-pointer hover:opacity-80 transition-opacity">
    <img 
      src={headerLogoIcon} 
      alt="eView" 
      className={`${className} select-none`}
    />
  </div>
);

export const LandingLogo = ({ className = "h-64 w-auto" }) => (
  <img 
    src={LandingLogoIcon} 
    alt="eView Logo" 
    className={`${className} select-none mx-auto`}
  />
);

export const FooterLogo = ({ className = "h-20 w-auto" }) => (
  <img 
    src={FooterLogoIcon} 
    alt="eView" 
    className={`${className} select-none bm-0 tm-0`}
  />
);