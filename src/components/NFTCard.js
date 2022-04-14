import React, { useEffect, useState } from "react";
import "../styles/NFTCard.css";
import { FaEthereum } from "react-icons/fa";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { ColorExtractor } from 'react-color-extractor'
import Card from "./base/Card";
import Button from "./base/Button";
import { Colors } from "../constants/Colors";

import { ModelViewerElement } from "@google/model-viewer";
import { useARStatus } from "../hooks/isARStatus";
import {useNavigate} from "react-router-dom";
import Moralis from "moralis";

const NFTCard = ({
                   tokenType,
                   name,
                   price,
                   img,
                   like,
                   inTeam,
                   tokenID,
                   onClick,
                   handleChangeTeam,
                   page
}) => {
  const [isLike, setIsLike] = useState(false);
  const [colors, setColors] = useState([]);

  const isARSupport = useARStatus(img);

  useEffect(() => {
    // console.log(isARSupport);
    console.log(tokenID, "in Team?", inTeam)
  }, [])

  const handleLike = () => setIsLike(!isLike);

  const getColors = colors => {
    setColors(c => [...c, ...colors]);
    //console.log(colors);
  }

  const getUser = async () => {
    // require login
    if (!Moralis.User.current()) {
      await Moralis.authenticate();
    }
    const user = Moralis.User.current();
    try{
      return user.get("ethAddress");
    }
    catch (e) {
      console.log(e.message)
      return null
    }
  }

  const team = Moralis.Object.extend("Team");
  const getTeam = async (user_address) => {
    const agent = new Moralis.Query(team);
    agent.equalTo("user", user_address);
    return await agent.find();
  }

  let navigate = useNavigate();
  const handleFight = async () => {
    const user = await getUser();
    if (!user) {
      alert('Please login!')
      return;
    }
    const userTeam = await getTeam(user);
    if (!userTeam.length) {
      alert('You need to setup a team first!')
      return;
    }
    const params = {attacker: userTeam[0].attributes.tokenID, defender: tokenID}
    console.log(params)

    // eslint-disable-next-line no-restricted-globals
    if (confirm(`Start fighting with ${name}?`)) {
      navigate("/game", {state: params})
    }
  }


  const handleChange = (e) => {
    console.log(e.target.innerText);
  }

  return (
    <Card
      blurColor={colors[0]} inTeam={inTeam}

      child={<>
        {
          isARSupport ?
            <model-viewer ar-scale="auto" ar ar-modes="webxr scene-viewer quick-look" id="reveal" loading="eager" camera-controls auto-rotate src={img} > </model-viewer>
            :
            <>
              <ColorExtractor getColors={getColors}>
                <img className="nft-image" src={img} />
              </ColorExtractor>
            </>
        }
        <div className="wrapper">
          <div className="info-container">
            <p className="owner">{tokenType === 1 ? "Artwork" : "Game Prop"}</p>
            <p className="name">{name}</p>
          </div>

          <div className="price-container">
            <p className="price-label">Price{" "}
              <FaEthereum /></p>
            <p className="price" onInput={handleChange}>
               {price}
            </p>
          </div>
        </div>
        <div className="buttons">
          {/* <button className="buy-now">Buy Now</button> */}
          {
            page === "arena-true" ? <Button color={inTeam ? Colors.buttons.danger :Colors.buttons.secondary}
                                            textContent={inTeam ? "Quit" : "Set in Team"}
                                            onClick={() => handleChangeTeam(tokenID)} /> :
            page === "arena-false" ? <Button color={Colors.buttons.danger}
                                             textContent={inTeam ? "Quit" : "Fight"}
                                             onClick={inTeam? () => handleChangeTeam(tokenID) : handleFight} /> : null
          }

          <Button color={Colors.buttons.primary} textContent="Detail" onClick={onClick} />
          <div className="like-container">
            <button className="like" onClick={handleLike}>
              {!isLike ? (
                <AiOutlineHeart size="30" color="white" />
              ) : (
                <AiFillHeart size="30" style={{
                  stroke: `-webkit-linear-gradient(
                    to bottom,
                    #38ef7d,
                    #11998e
                  );`
                }} color='#00f5c966' />
              )}
            </button>
            <p className="like-count">{like}</p>
          </div>
        </div>
      </>}>

    </Card>
  );
};

export default NFTCard;

