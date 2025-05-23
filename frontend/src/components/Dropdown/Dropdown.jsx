import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import './Dropdown.scss';


const Dropdown = ({ 
  options=[], 
  isSearchable=true, 
  isClearable=true, 
  isDisabled=false, 
  onChange,
  placeholder='Select...',
  value=null
}) => {

  return(
    <Select
      className="select"
      classNamePrefix="react-select"
      placeholder={placeholder}
      options={options}  // pass prop
      isSearchable={isSearchable}  // pass prop
      isClearable={isClearable}
      isDisabled={isDisabled}
      onChange={onChange}
      value={value}
    />
  );
};

export default Dropdown;