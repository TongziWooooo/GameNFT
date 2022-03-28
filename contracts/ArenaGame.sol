pragma solidity ^0.8.10;

import "./GameNFT.sol";
import "hardhat/console.sol";

contract ArenaGame{
    uint constant gameFee = 0.005 ether;
    uint constant minPrice = 0.01 ether;

    GameNFT gameNFT;

    enum _ResultType{
        Win,
        Lose
    }

    struct GameInfo{
        address player;
        _ResultType result;
    }

    GameNFT.PlayerInfo t;

    struct HeroInfo{
        uint attack;
        uint armor;
        uint speed;
        uint luck;
        uint healthPower;
    }

    GameInfo[] public GameRecords;

    constructor(GameNFT _gameNFT) public{
        gameNFT = _gameNFT;
    }

    function createGame(address player1, address player2)
        public view returns(_ResultType, string[] memory){

        HeroInfo memory hero1Info = HeroInfo(10, 10, 10, 10, 50);
        HeroInfo memory hero2Info = HeroInfo(12, 8, 5, 20, 50);

        (_ResultType gameResult, string[] memory resultLog)  = fight(hero1Info, hero2Info);

        return (gameResult, resultLog);
    }

    function fight(HeroInfo memory hero1Info, HeroInfo memory hero2Info)
        public view returns (_ResultType, string[] memory){



        string[] memory resultLog = new string[](10);


        return (_ResultType.Win, resultLog);
    }



    function createGameBP(uint player1TokenID, uint player2TokenID)
        public view returns (_ResultType, string memory){

        // require(msg.value >= minPrice, "The minimal stake is required");
        // require(gameNFT.ownerOf(player1TokenID) == msg.sender, "This is not your NFT");

        GameNFT.PlayerInfo memory player1Info = gameNFT.getProperty(player1TokenID);
        GameNFT.PlayerInfo memory player2Info = gameNFT.getProperty(player2TokenID);

        (_ResultType gameResult, string memory resultLog)  = fightBP(player1Info, player2Info);


        return (gameResult, resultLog);
    }



    function fightBP(GameNFT.PlayerInfo memory player1Info, GameNFT.PlayerInfo memory player2Info)
        public view returns (_ResultType, string memory){

        string memory resultLog = "1,2,3,4,5";


        return (_ResultType.Win, resultLog);
    }

}