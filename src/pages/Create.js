import react, {useEffect, useState} from "react";
import Accordion from "../components/base/Accordion";
import AccordionHeader from "../components/base/AccordionHeader";
import Button from "../components/base/Button";
import Card from "../components/base/Card";
import Checkbox from "../components/base/Checkbox";
import Image from "../components/base/Image";
import Select from "../components/base/Select";
import TextInput from "../components/base/TextInput";
import { Colors } from "../constants/Colors";
import {AiFillHeart, AiOutlineHeart, AiOutlineSearch} from 'react-icons/ai';
import Header from "../components/Header";
import {ColorExtractor} from "react-color-extractor";
import {FaEthereum} from "react-icons/fa";
import React from "react";
import {useMobile} from "../hooks/isMobile";
import {useNavigate} from "react-router-dom";

import Moralis from "moralis";
import GameNFT from '../artifacts/contracts/GameNFT.sol/GameNFT.json'
import {ethers} from "ethers";
import {useMoralis} from "react-moralis";
import {gameNFTAddress} from "../App"

const Create = () => {
  const padding = "5px";
  const isMobile = useMobile();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  useEffect(() => {
    console.log('name: ', name);
  }, [name])
  const handleName = (e) => {
    setName(e.target.value);
  }

  const [desc, setDesc] = useState("");
  useEffect(() => {
    console.log('desc: ', desc);
  }, [desc])
  const handleDesc = (e) => {
    setDesc(e.target.value);
  }

  const [file, setFile] = useState();
  useEffect(() => {
    console.log('file: ', file);
  }, [file])
  const handleFile = (e) => {
    setFile(e.target.files[0]);
  }

  const [price, setPrice] = useState();
  useEffect(() => {
    console.log('price: ', price);
  }, [price])
  const handlePrice = (e) => {
    setPrice(e.target.value);
  }

  const [tokenType, setTokenType] = useState(1);
  useEffect(() => {
    console.log('tokenType: ', tokenType);
  }, [tokenType])
  const handleTokenType = (e) => {
    e.target.value === "artwork" ? setTokenType(1) : setTokenType(0);
  }

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const { authenticate, isAuthenticated, isAuthenticating, user} = useMoralis();
  const handleClick = async () => {
    // require login
    let current_user = user
    console.log(current_user)
    if (!isAuthenticated) {
      await authenticate().then(function (user) {
        console.log(user.get('ethAddress'))
        current_user = user
        console.log(current_user)
      })
    }
    const user_address = current_user.get("ethAddress")
    console.log("User:", user_address)

    // check fields
    if (!name || !desc || !file || !price) {
      alert("Please fill every input!");
      return
    }

    let attributes = {};
    // generate game attributes
    if (tokenType === 0) {
      attributes = {
        "attack_base": getRandomInt(1, 20),
        "armor_base": getRandomInt(1, 20),
        "speed_base": getRandomInt(1, 10),
        "hp_base": getRandomInt(1, 100),
        "attack_growth": getRandomInt(1, 10),
        "armor_growth": getRandomInt(1, 10),
        "speed_growth": getRandomInt(1, 10),
        "hp_growth": getRandomInt(1, 10),
        "level": getRandomInt(1, 10),
        "luck": getRandomInt(1, 100)
      }
    }

    // upload img file
    const img_file = new Moralis.File(name, file);
    await img_file.saveIPFS();
    console.log("Uploaded img:", img_file.ipfs(), img_file.hash());

    // upload metadata
    const object = {
      "name" : name,
      "description": desc,
      "img": img_file.ipfs(),
      "tokenType": tokenType,
      "attributes": attributes
    }
    const nft_file = new Moralis.File(name + ".json", {base64 : btoa(JSON.stringify(object))});
    await nft_file.saveIPFS();
    console.log("Uploaded NFT metadata:", nft_file.ipfs(), nft_file.hash());
    const tokenURI = nft_file.ipfs();

    // send transaction in blockchain
    if (typeof window.ethereum !== 'undefined') {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()
    const contract = new ethers.Contract(gameNFTAddress, GameNFT.abi, signer)
    const transaction = await contract.mintItem(tokenURI, tokenType)
    const rc = await transaction.wait()
    const event = rc.events.find(event => event.event === "NFTCreated")
    const [q,w,e,c] = event.args
    console.log("args", event.args)
    console.log(transaction)
    const tokenID = parseInt(q._hex, 16);


    // create reference in database
    const NFT = Moralis.Object.extend("NFT");
    const nft = new NFT();

    nft.set("name", name);
    nft.set("description", desc);
    nft.set("img", img_file.ipfs());
    nft.set("tokenType", tokenType)
    nft.set("attributes", attributes);
    nft.set("tokenURI", tokenURI);
    nft.set("owner", user_address);
    nft.set("minter", user_address)
    nft.set("contract", gameNFTAddress);
    nft.set("tokenID", tokenID);
    nft.set("isListed", false);
    nft.set("price", price);
    nft.set("like", 0);

    nft.save()
        .then((nft) => {
          // Execute any logic that should take place after the object is saved.
          console.log('New object created with objectId: ' + nft.id);
          // eslint-disable-next-line no-restricted-globals
          if (confirm("Successfully create! Name: " + name + ", Desc:" + desc)){
            navigate('/collection');
          }
        }, (error) => {
          // Execute any logic that should take place if the save fails.
          // error is a Moralis.Error with an error code and message.
          alert('Failed to create new object, with error code: ' + error.message);
        });
  }

  return (
    <>
      <Header />
      <div id="nft-detail-card-wrapper">
        <Card
          width={isMobile ? "100%" : "65vw"}
          height={isMobile ? "700px" : "88vh"}
          child={
            //Detail Content
            <div id="detail-content">

              <div id="detail-info" style={{"textAlign": "center", "justifyContent": "center", "width": "100%"}}>
                <div id='detail-info-container'>
                  <TextInput type={"radio"} height={"60px"} setValue={setTokenType} padding={padding} child={
                    <div>
                      <label className="container" style={{"fontSize": "20px"}}>
                        {"Artwork"}
                        <input type="radio" onChange={handleTokenType} value={"artwork"} name={"tokentype"} defaultChecked/>
                        <span className="checkmark"/>
                      </label>
                      <label className="container" style={{"fontSize": "20px"}}>
                        {"Game Prop"}
                        <input type="radio" onChange={handleTokenType} value={"game prop"} name={"tokentype"}/>
                        <span className="checkmark"/>
                      </label>
                    </div>
                  }/>
                  <TextInput padding={padding} child={
                    <input id="search" placeholder={"Name"} onChange={handleName}/>
                  }/>
                  <TextInput height={"300px"} padding={padding} child={
                    <textarea id="search" style={{"resize":"none", "borderRadius":"0px"}} placeholder={"Description"} onChange={handleDesc}/>
                  }/>
                  <TextInput padding={padding} child={
                    <input id="search" type="file" onChange={handleFile}/>
                  }/>
                  <TextInput padding={padding} child={
                    <input id="search" placeholder={"Price"} onChange={handlePrice}/>
                  }/>
                  <Button
                    width="20%"
                    height="40px"
                    padding={padding}
                    textContent="Submit"
                    color={Colors.buttons.success}
                    onClick={handleClick}
                  />
                </div>
              </div>

            </div>
          }
        />

      </div>
    </>
  );
};

export default Create;
