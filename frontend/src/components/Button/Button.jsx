import React from 'react';
import clsx from "clsx";
import './Button.scss';

const Button = ({ 
  title = "button", 
  color = "#007bff", 
  textColor = "#fff", 
  onClick = () => {}, 
  tooltip = "", 
  className = "", 
  disabled=false,
  allowPropagation=false,
}) => {

  const handleClick = (e) => {
    if (!allowPropagation) {
      e.stopPropagation();
    }
    onClick(e);
  };

  return (
    <div className="button-wrapper">
      <button 
        className={clsx("button", className)} 
        style={{ backgroundColor: color, color: textColor }} 
        onClick={handleClick} 
        disabled={disabled}
      >
        {title}
      </button>
      {tooltip && <span className="tooltip">{tooltip}</span>}
    </div>
  );
};

export default Button;