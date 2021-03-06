import React from "react";
import NFTCard from "./NFTCard";
import "../styles/CardList.css";
import { useNavigate } from "react-router-dom";

const CardList = ({ list,type="horizontal", page, handleChangeTeam, handleFight}) => {
  let navigate = useNavigate();

  console.log(list);
  return (
    <div id="card-list" style={{flexDirection:type=="horizontal" ? "row" : "column"}}>
      {list.map((item,index) => (
        <NFTCard
          // nftSrc={item.src}
          {...item}
          key={index}
          onClick={()=>navigate('/detail',{state:{item:item, page:page}})}
          handleChangeTeam={handleChangeTeam}
          handleFight={handleFight}
          page={page}
        />
      ))}
    </div>
  );
};

export default CardList;
