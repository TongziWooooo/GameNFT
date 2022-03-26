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

const Create = () => {
  const padding = "5px";
  const isMobile = useMobile();


  const [name, setName] = useState("");
  useEffect(() => {
    console.log('name: ', name);
  }, [name])

  const [desc, setDesc] = useState("");
  useEffect(() => {
    console.log('desc: ', desc);
  }, [desc])

  const [file, setFile] = useState();
  useEffect(() => {
    console.log('file: ', file);
  }, [file])

  const [price, setPrice] = useState();
  useEffect(() => {
    console.log('price: ', price);
  }, [price])

  const handleClick = () => {
    alert("Successfully create! Name: " + name + ", Desc:" + desc);
  }

  return (
    <>
      <Header />
      <div id="nft-detail-card-wrapper">
        <Card
          width={isMobile ? "100%" : "65vw"}
          height={isMobile ? "700px" : "60vh"}
          child={
            //Detail Content
            <div id="detail-content">

              <div id="detail-info" style={{"text-align": "center", "justify-content": "center", "width": "100%"}}>
                <div id='detail-info-container'>
                  <TextInput placeholder={"Name"} setValue={setName} padding={padding}/>
                  <TextInput placeholder={"Description"} height={"300px"} setValue={setDesc} type={"long text"} padding={padding}/>
                  <TextInput type={"file"} padding={padding} setValue={setFile}/>
                  <TextInput placeholder={"Price"} padding={padding} setValue={setPrice}/>
                  <Button
                    width="20%"
                    height="40px"
                    padding={padding}
                    textContent="Submit"
                    color={Colors.buttons.succes}
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
