import React, { useEffect, useState } from "react";
import '../../styles/base/TextInput.css';

//Base Input Component
//Usage: <Input width='550px' height='30px' />

const TextInput = ({width, height, padding="0px", icon, child, style}) => {
  return (
    <div className="search-wrapper" style={{"padding": padding, ...style}}>
      <div
        className="search-container"
        style={{
          width:`${width}`,
          height:`${height}`,
          background: `radial-gradient(
                    circle,
                    rgba(255, 255, 255, 0.05) 0%,
                    rgba(48,118,234,0.2) 0%,
                    rgba(255, 255, 255, 0.05) 70%
                )`,
        }}
      >
        {child}
        {icon}
      </div>
    </div>
  );
};

export default TextInput;
