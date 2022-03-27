import React, { useEffect, useState } from "react";
import CardList from "../components/CardList";
import '../styles/Explore.css';
import Header from "../components/Header";
import Search from "../components/Search";
import Moralis from "moralis";
import {useMoralis} from "react-moralis";


const MyCollection = () => {
  const NFT = Moralis.Object.extend("NFT");

  const [exploreData, setExploreData] = useState([]);
  const { authenticate, isAuthenticated, isAuthenticating, user} = useMoralis();

  // const [current_user, setUser] = useState(user);
  // useEffect(() => {
  //   setUser(current_user)
  //   console.log('current user: ', current_user);
  // }, [isAuthenticated])

  useEffect(() => {
    const fetchData = async () => {
      // require login
      let current_user = user
      console.log(current_user)
      console.log(isAuthenticated)
      if (!isAuthenticating && !isAuthenticated) {
        setExploreData([]);
        await authenticate().then(function (user) {
          console.log(user.get('ethAddress'))
          current_user = user
          console.log(current_user)
        })
      }
      else {
        const query = new Moralis.Query(NFT);
        query.equalTo("owner", current_user.get("ethAddress"));
          const results = await query.find();
        const parsed_results = results.map((item) => (
            item.attributes
        ))
        console.log(parsed_results)
        setExploreData(parsed_results);
      }
    }
    fetchData();
  }, [isAuthenticated])

  return (
    <div id="my-collection">
      <Header />
      <Search/>
      <div id="list-container" style={{"margin-top": "90px"}}>
        <CardList list={exploreData} />
      </div>
    </div>
  );
};

export default MyCollection;
