import react, { useContext } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useMoralis } from "react-moralis";

const Header = () => {
    let navigate = useNavigate();


    const { authenticate, isAuthenticated, isAuthenticating, user, logout } = useMoralis();

    const login = async () => {
        if (!isAuthenticated) {

            await authenticate({signingMessage: "Log in using Moralis" })
                .then(function (user) {
                    console.log("logged in user:", user);
                    console.log(user.get("ethAddress"));
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
    }

    const logOut = async () => {
        await logout();
        console.log("logged out");
    }

    return (
        <div id="header" style={{"position": "fixed"}}>
        <Link to='/' id='logo'>NFT Room</Link>

        <div id="link-containers">
          <a onClick={() => navigate("/explore")}>Start Hunting</a>
          <a>Dark NFTs</a>
          <a>Community</a>
          <a onClick={() => navigate("/create")}>Craft NFT</a>
          {!isAuthenticated ? null : <a>{"Welcome, " + user.get("ethAddress")}</a> }
          <button id="connect-wallet" onClick={!isAuthenticated ? login : logOut} >{!isAuthenticated ? 'Connect Wallet' : 'Logout'}</button>
        </div>
      </div>
    );
}

export default Header;