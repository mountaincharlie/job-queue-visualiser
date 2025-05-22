import React from 'react';
import ClipLoader from "react-spinners/ClipLoader"
import './LoadingSpinner.scss'


const LoadingSpinner = ({ 
  height = '100px', 
  width = '100px'
}) => {

  return(
    <div 
      className="loading-spinner"
      style={{ height: height, width: width }}
    >
      <ClipLoader
        size={70}
        aria-label="Loading Spinner"
        data-testid="loader"
        speedMultiplier={0.7}
      />
      <span className="loading-spinner-text">Processing ...</span>
    </div>
  );
};

export default LoadingSpinner;
