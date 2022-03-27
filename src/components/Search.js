import React from "react";
import TextInput from "./base/TextInput";
import { AiOutlineSearch } from "react-icons/ai";

const Search = ({handleQuery, handleClick, handleKeyDown}) => {
  return (
    <div style={{"position": "relative", "top": "90px"}}>
      <TextInput
        icon={<AiOutlineSearch onClick={handleClick} size="30" color="rgba(48,118,234,1)"/>}
        child={
          <input id="search" placeholder={"Explore NFTs"} onChange={handleQuery} onKeyDown={handleKeyDown}/>
        }
      />
    </div>
  );
};

export default Search;
