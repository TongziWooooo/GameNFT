import React, { useState, useEffect, createRef } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import { useLocation, Navigate } from "react-router";
import Card from "../components/base/Card";
import "../styles/NFTDetail.css";
import { ColorExtractor } from "react-color-extractor";
import Button from "../components/base/Button";
import { FaEthereum } from "react-icons/fa";
import { AiOutlineHeart, AiFillHeart, AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";
import { useMobile } from "../hooks/isMobile";
import { hotDropsData } from "../constants/MockupData";
import NFTCard from "../components/NFTCard";
import { useARStatus } from "../hooks/isARStatus";
import TextInput from "../components/base/TextInput";
import Checkbox from "../components/base/Checkbox";
import {Colors} from "../constants/Colors";



const NFTDetail = () => {
  const isMobile = useMobile();

  const [colors, setColors] = useState([]);

  const [isLike, setIsLike] = useState(false);
  
  

  const like = () => setIsLike(!isLike);

  const getColors = (colors) => {
    setColors((c) => [...c, ...colors]);
  };

  const navigate = useNavigate();

  const { state } = useLocation();

  useEffect(() => {
    setColors([]);
  }, [state]);

  const isARSupport = useARStatus(state.item.img);

  const [price, setPrice] = useState(state.item.price);
  useEffect(() => {
    console.log("price: ", price);
  }, [price])
  const handlePrice = (e) => {
    setPrice(e.target.value);
  }

  const [isListed, setIsListed] = useState(state.item.isListed);
  useEffect(() => {
    console.log("isListed: ", isListed);
  }, [isListed])
  const handleListed = () => {
    setIsListed(!isListed);
  }

  const handleClick = () => {

  }

  //!! aciklama karakter sayisi sinirlanmali.
  //!! scroll sorununa cozum bulunmali.

  return (
    <div>
      <Header />
      <div id="nft-detail-card-wrapper">
        <Card
          width={isMobile ? "100%" : "65vw"}
          height={isMobile ? "700px" : "60vh"}
          blurColor={colors[0]}
          child={
            //Detail Content
            <div id="detail-content">
              {isARSupport ?
                <model-viewer ar-scale="auto" ar ar-modes="webxr scene-viewer quick-look" id="arDetail" loading="eager" camera-controls auto-rotate src={state.item.img} > </model-viewer>
                :
                <> <ColorExtractor getColors={getColors}>
                  <img id="detail-image" src={state.item.img} />
                </ColorExtractor></>
              }

              <div id="detail-info" style={{}}>
                <div id='detail-info-container' style={{"position": "relative"}}>
                  <p id="name"> {state.item.name} </p>
                  <p id="collection"> {state.item.tokenType === 1 ? "Artwork" : "Game Prop"} </p>
                  <p id="description" > {state.item.description} </p>
                  {state.page === "collection" ?
                    <div>
                      <TextInput style={{"position": "absolute", "bottom": "60px"}} child={
                        <label className="container" style={{"font-size": "25px"}}>
                          {"Publish your NFT!"}
                          <input type="checkbox" onChange={handleListed} checked={isListed}/>
                          <span className="checkmark"/>
                        </label>
                      }/>
                      <TextInput style={{"position": "absolute", "bottom": "0"}} icon={<FaEthereum style={{"color": "#C6C2C6"}} size="28px"/>} child={
                        <input id="search" style={{"font-size": "25px"}} placeholder={"Name"} onChange={handlePrice} value={price}/>
                      }/>

                    </div>
                    :
                    null
                  }

                </div>

                {state.page === "explore" ?
                  <div id="detail-controls">
                    <Button
                      width={isMobile ? "70%" : "70%"}
                      height="50px"
                      child={
                        <div id="button-child">
                          <FaEthereum size="28px"/>
                          <p id="price"> {state.item.price}</p>
                        </div>
                      }
                    />
                    <div className="like-container">
                      <button className="like" onClick={like}>
                        {!isLike ? (
                          <AiOutlineHeart size="45" color="white"/>
                        ) : (
                          <AiFillHeart
                            size="45"
                            style={{
                              stroke: `-webkit-linear-gradient(
                    to bottom,
                    #38ef7d,
                    #11998e
                  );`,
                            }}
                            color="#00f5c966"
                          />
                        )}
                      </button>
                      <p className="like-count">{state.item.like}</p>
                    </div>
                  </div>
                  :
                  <div>
                    <Button width='100px' height='50px' color={Colors.buttons.secondary} textContent="Submit" onClick={handleClick}/>
                  </div>
                }
              </div>
            </div>
          }
        />
        
      </div>

    </div>
  );
};

export default NFTDetail;
