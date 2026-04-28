import React from 'react';

interface QRCodeProps {
  size?: number;
  className?: string;
}

const QRCode: React.FC<QRCodeProps> = ({ size = 160, className }) => {
  // A simple, static SVG to represent a QR code for mockup purposes.
  // This avoids the need for an external image asset.
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      shapeRendering="crispEdges"
    >
      <path fill="#000" d="M0 0h30v30H0z m10 10h10v10H10z M70 0h30v30H70z m10 10h10v10H80z M0 70h30v30H0z m10 10h10v10H10z M40 0h10v10H40z M50 0h10v10H50z M60 0h10v10H60z M0 40h10v10H0z M0 50h10v10H0z M0 60h10v10H0z M40 90h10v10H40z M50 90h10v10H50z M60 90h10v10H60z M90 40h10v10H90z M90 50h10v10H90z M90 60h10v10H90z M40 40h10v10H40z M50 50h10v10H50z M60 60h10v10H60z M70 70h10v10H70z M40 20h10v10H40z M20 40h10v10H20z M70 40h10v10H70z M40 70h10v10H40z"/>
      <path fill="#444" d="M30 0h10v10H30z M60 10h10v10H60z M10 30h10v10H10z M30 30h10v10H30z M80 30h10v10H80z M20 60h10v10H20z M30 80h10v10H30z M60 80h10v10H60z M80 80h10v10H80z"/>
    </svg>
  );
};

export default QRCode;