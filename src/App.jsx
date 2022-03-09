import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/WavePortal.json";
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import { red } from '@mui/material/colors';
import { lightBlue } from '@mui/material/colors';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [val, setVal] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const contractAddress = "0x6ee07c0F6b55Cf31C118be26CC0a2a7bB1B1FB60";
  const contractABI = abi.abi;
  const chainId = "0xA869";
  const networkName = "Avalanche FUJI C-Chain";
  let topic = "";

  function resetTopic(){
    topic="";
  }
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Please install MetaMask.");
        return;
      } else {
        console.log("User has MetaMask installed.", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        getAllWaves();
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Please install MetaMask.");
        return;
      }
      else {
        try {
        console.log("Switching to %s (chain id: %s)", networkName, chainId);
        await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{
          chainId:chainId
        }],
      });
        }
        catch (switchError) {
          if (switchError.code === 4902) {
          console.log("User does not have %s installed.", networkName);
          console.log("Attempting to add network: %s", networkName);
          try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
          {
            chainId: chainId,
            chainName: networkName,
            rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
            symbol: 'AVAX',
            blockExplorerUrls: ['https://testnet.snowtrace.io/'],
          },
        ],
      });
          } catch (error){
             console.log("Unable to install %s. Try to install manually or wait and try again.", networkName);
          }
          }
        }
      }
      
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

   const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();


        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        
        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        /*
        * Execute the actual wave from your smart contract
        */
        const waveTxn = await wavePortalContract.wave(val);
        console.log('you just sent a meeting request with the following topic: %s', val)
        console.log("Mining...", waveTxn.hash);
        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);
        setVal(() => "");

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])
 return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
         👋 Hey, I'm Shreyas
        </div>
        <div className="bio">
        ['insert an actual bio lol']
        </div>
        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && ( <div className="bio">
        Connect your <mark>Avalanche</mark> wallet to schedule a time to meet!
        </div>

        )}
        {!currentAccount && (<Button variant="outlined" color="error" onClick={connectWallet} className="buttons">
          Connect 
          <img src='./avax-logo.png' className="avaxlogo" height="8px;"></img>
          </Button>
        )}
        {currentAccount && (
       <div className="bio">
       <TextField required id="outlined-basic" label="Meeting Topic" value={val}  variant="outlined" helperText="e.g., NFT discussion" onChange={(e) => { setVal(() => e.target.value)}}/>
       </div>
      )}
        {currentAccount && (
       <div className="bio">
         <b>Select a date and time below:</b>
       </div>
      )}
        {currentAccount && 
        (<Button variant="contained" onClick={wave}>Let's chat!</Button>

      )}
        <Typography variant="overline">
          <div>
          Latest requests:
          </div>
        </Typography>
      {allWaves.slice(0).reverse().slice(0,5).map((wave, index) => {
          return (
            <Card key={index} sx={{bgcolor: lightBlue[50],                   boxShadow: 10,
}}>
              <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: lightBlue[500] }} aria-label="recipe">
            SB
          </Avatar>
        }
        title={
          <Typography variant="subtitle1">
        {wave.message}
          </Typography>
        }
      />
              <CardContent>
              <Typography color="text.secondary">Address: <Link href="https://testnet.snowtrace.io/">
                {wave.address}</Link></Typography>
              <Typography color="text.secondary">Time: {wave.timestamp.toString()}</Typography>
              </CardContent>
                  
            </Card>
          )
        })}
       </div>
   </div>
  );
}
export default App