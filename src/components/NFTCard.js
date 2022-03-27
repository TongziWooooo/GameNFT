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



const NFTCard = ({
                   tokenType,
                   name,
                   price,
                   img,
                   like,
                   onClick
}) => {
  const [isLike, setIsLike] = useState(false);
  const [colors, setColors] = useState([]);

  const isARSupport = useARStatus(img);

  useEffect(() => {
    console.log(isARSupport);
  }, [])

  const handleLike = () => setIsLike(!isLike);

  const getColors = colors => {
    setColors(c => [...c, ...colors]);
    //console.log(colors);
  }


  const handleChange = (e) => {
    console.log(e.target.innerText);
  }


  return (
    <Card
      blurColor={colors[0]}

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
            <p className="price" contentEditable={"true"} onInput={handleChange}>
               {price}
            </p>
          </div>
        </div>
        <div className="buttons">
          {/* <button className="buy-now">Buy Now</button> */}
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

