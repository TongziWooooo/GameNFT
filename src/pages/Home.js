import react from "react";
import React, { useEffect, useState } from "react";
import Hero from "../components/Hero";
import "../styles/Home.css";
import CardList from "../components/CardList";
import { hotDropsData } from "../constants/MockupData";



const Home = () => {

  const [hotData, setHotData] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      const result = hotDropsData;  // TODO: request hot data
      setHotData(result);
    }
    fetchData();
  }, [])


  return (
    <div id="home">
      <Hero list={hotData} />

      {/*<p id="card-list-header-text"> Hot Drops </p>*/}
      {/*<div id="list-container">*/}
      {/*  <CardList list={hotData} />*/}
      {/*</div>*/}
    </div>
  );
};

export default Home;
