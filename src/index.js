import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Create from "./pages/Create";
import Explore from "./pages/Explore";
import MyCollection from "./pages/MyCollection";
import GameArena from "./pages/GameArena";
import Game from "./pages/Game";
//dapp
import NFTDetail from "./pages/NFTDetail";
import { MoralisProvider } from "react-moralis";
import Moralis from "moralis";

const serverUrl = "https://r6bsuhtagkz4.usemoralis.com:2053/server";
const appId = "mHzShlD3IGTeBt5JBo1vKbjFGvdsLBtsId1wrvek";
Moralis.start({ serverUrl, appId });

ReactDOM.render(
  <BrowserRouter>
      <MoralisProvider serverUrl="https://r6bsuhtagkz4.usemoralis.com:2053/server" appId="mHzShlD3IGTeBt5JBo1vKbjFGvdsLBtsId1wrvek">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<Create />} />
          <Route path="/collection" element={<MyCollection />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/detail" element={<NFTDetail />} />
          <Route path="/arena" element={<GameArena />} />
          <Route path="/game" element={<Game />} />
          <Route path="/test" element={<App />} />
        </Routes>
      </MoralisProvider>
    </BrowserRouter>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
