# Turn Tracker

This is a Simple and Responsive Manager for Turn Based RPG Combats. Designed with D&D in mind but its functional in many systems.

### A Live Version Hosted on Heroku Can be Found at [Turn-Tracker](https://turn-tracker.herokuapp.com/) 

Works with real time Interactions between players and GMs segmented in Rooms, any of wich showing Combat information public or hidden as GM Will. Each Player has Individual and private Notes too.

The platform Supports Real time Chat, with Dice Rolls and Image Share using URLs. The Turn control could be public or Only on GM hands.

Runs Multiples Rooms at same time with a Lobby system, and a future Feature will be the hability to Load and Save Entitys and Combat Status anytime.

## Technologies

Runs with Node. 

Pages are created With HTML CSS and JavaScript. Using only JS to render Content and interactions, and the P5js Library to Render the Stars Background.

Its Based on the Express.js Framework to Manage Routing, delivering pages, and serving the Websocket API.

Websocket API that runs With SocketIO applied. 

Relies on 'Roll' library to Manage Dice Rolls on Chat, and 'Valid-URL' to validate images urls shared on Chat.

## Dependencies

  * Express 
  * Roll
  * Socket.io 
  * Valid-url 
  * Body-Parser
  * EJS
  
## Installation:  

Clone down this repository to your machine. You will need node and npm installed.  

Installation:

`npm install`  

To Start Server:

`npm start`  

The App will start on:

`localhost:8888/`

## Screenshots 
![alt text](https://i.ibb.co/KjycHmV/home.png)
![alt text](https://i.ibb.co/wQMTrm1/create.png)
![alt text](https://i.ibb.co/Jjhh0Hs/game-1.png)
![alt text](https://i.ibb.co/hH6TTxB/lobby.png)
![alt text](https://i.ibb.co/GsPjPJr/game2.png)
![alt text](https://i.ibb.co/3rHKZnF/smart.png)
![alt text](https://i.ibb.co/99Z92Rp/smart2resize.png)
![alt text](https://i.ibb.co/xFh7CTY/lobby2.png)
