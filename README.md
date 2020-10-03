# Chess Website

## Introduction

The aim of this project is to create a website in which a user can challenge other users over the internet to a game of chess. Users will initially enter a username. They will be presented with a list of other users they can challenge. Once they challenge a user or are challenged, and the one challenged accepts the match, the two users will be able to play a game of chess. You can try it at https://dz-chess-app.herokuapp.com/

## User Interface

![Landing Page](https://i.imgur.com/Yz7WpWu.png)

The landing page is quite simple. After entering your name, you are shown a list of present users, with buttons allowing you to challenge each one. When a user is challenged, a prompt will appear below allowing that user to accept or decline that challenge. Alternatively, one can choose to play a local game in which both players play on the same machine. When two users agree to play a game, they should be removed from the list of available users and put into the list of currently active games.

![Game page](https://i.imgur.com/JQVBBdF.png)

This screen is when you’re actually challenging another user. The middle area contains the chess game, which is controlled via the mouse. The left side displays the move history, while the right side displays the time each user has spent with their moves, as well as their current score. In a local match, the names on the right side would be replaced by “white” and “black”. In online games, ther is also a "chat" feature that allows players to communicate.

## System Design

My current plan is to build the frontend using ReactJS, since React makes it easier to render changing entities such as the player list or the chess board. The backend server that handles matching players up and running the chess games will use NodeJS, with websockets connecting the client and server. Websockets are being used over http since they seem better to use for frequent real-time updates in games such as chess. Persistent data, including players and gamestates, are stored using Google Firestore and retrieved by the node.js server, which doesn't hold any persistent data. The project will likely be hosted on Heroku, since I’ve been able to use that in a previous project for multiplayer games.

![System Design](https://i.imgur.com/Zzp9lWz.jpg)

## Schedule

* Week 1: Finish chess class that accurately simulates a game of chess - Complete
* Week 2: Create local multiplayer version of chess website that allows two players on the same machine to play with each other. - Complete
* Week 3: Enable users to challenge and play against others over the internet - By 9/18-9/23, hopefully
* Week 4: (Tentative) Allow users to save a game and continue that game at a later date.
* Week 5: Integrate firestore.
