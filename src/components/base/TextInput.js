import React, { useEffect, useState } from "react";
import '../../styles/base/TextInput.css';

//Base Input Component
//Usage: <Input width='550px' height='30px' />

const TextInput = ({width, height, padding="0px", placeholder='default input', icon,type, setValue}) => {
  // const [value, setValue] = useState("")
  const handleChange = (e) => {
    if (type === "file")
      setValue(e.target.files[0]);
    else if (type === "radio")
      e.target.value === "artwork" ? setValue(1) : setValue(0);
    else
      setValue(e.target.value);
  }

  // useEffect(() => {
  //     console.log('value: ', value);
  // }, [value]);
  return (
    <div className="search-wrapper" style={{"padding": padding}}>
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
        {type === "long text" ?
          <textarea id={"search"} style={{"resize":"none", "border-radius":"0px"}} placeholder={"Description"} onChange={handleChange}/>
          :
          type === "radio" ?
            <div>
              <label className="container" style={{"font-size": "20px"}}>
                {"artwork"}
                <input type="radio" onChange={handleChange} value={"artwork"} name={"tokentype"} defaultChecked/>
                <span className="checkmark"/>
              </label>
              <label className="container" style={{"font-size": "20px"}}>
                {"weapon(game)"}
                <input type="radio" onChange={handleChange} value={"weapon"} name={"tokentype"}/>
                <span className="checkmark"/>
              </label>
            </div>
            :
            <input id="search" placeholder={placeholder} type={type} onChange={handleChange}/>
        }
        {icon}
      </div>
    </div>
  );
};

export default TextInput;
