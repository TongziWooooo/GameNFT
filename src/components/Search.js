import React from "react";
import TextInput from "./base/TextInput";
import { AiOutlineSearch } from "react-icons/ai";

const Search = () => {
  return (
    <div id="abc" style={{"position": "relative", "top": "90px"}}>
      <TextInput
        icon={<AiOutlineSearch size="30" color="rgba(48,118,234,1)"/>}
        child={
          <input id="search" placeholder={"Explore NFTs"} />
        }
      />
    </div>
  );
};

export default Search;
