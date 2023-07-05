# Cell-Collection

Players take turns placing their cells on the board. If a player places a new cell adjacent to one or more of their existing cells, then their existing cell(s) extend to include the new cell. 

## TODO
* Refactor Board class
    * create Cell class
    * create Connection class (connected component)
    * improve sizing
* Create Player class
    * track moves, connections, score
* UI/UX
    * make responsive
    * select board size
    * select scoring mechanism (maybe change colors)
    * undo move
* multi-level modeling
    * create layers
    

## Scoring Mechanisms


### Cell-Multiplication
>Product of the size (number of cells) of the connected components

Step into the dynamic world of Cell-Multiplication, where each cell you place holds the potential to exponentially elevate your score. As players take their turns, they strategically create groups of interconnected cells, or clusters. The twist in this game is the powerful multiplication effect: each cluster's size multiplies to determine your score. So, if you have clusters containing 2, 3, and 4 cells, your score rockets to 2 x 3 x 4 = 24 points! In Cell-Multiplication, it's not just about quantity but quality – cleverly cultivate and multiply your clusters to reach dizzying heights on the scoreboard!


### Cell-Connection
>The total number of edges (connections/extensions)

Get ready to make connections like never before in the electrifying game of Cell-Connection. Here, each player tries to outsmart their opponent by meticulously placing cells to create a wealth of connections on the grid. Each connection scores you points, propelling your score upwards. But here's the catch - a well-placed "wall" of your cells can hinder your opponent, blocking their path and disrupting their score-building strategy. So in Cell-Connection, it's not just about building bridges, but knowing when to build walls too. Keep your friends close, but your enemies closer, as you weave your way to victory in Cell-Connection!


### Cell-Maximization
>The size of the largest connected component

Embark on a mission of unity in the game of Cell-Maximization, where the ultimate goal is to forge the largest single assembly of cells. As players artfully arrange their cells on the grid, they're aiming to create a vast, interconnected network. But only the size of your largest cluster matters here - it's your direct ticket to a high score! In Cell-Maximization, size truly does matter! So strategize, synchronize, and aim to construct a colossal cluster that catapults you to the top!

### Cell-Extension
>The largest diameter of the graph

Welcome to the world of Cell-Extension, a game where each move is a step into uncharted territory. In this game, players transform the square grid into a fascinating maze of cells, carefully carving out the longest path within their cellular territory. This path, the 'diameter' of your domain, is your ticket to victory! Imagine your cells as daring explorers, charting a course through vast landscapes. The longer the journey they can make without retracing their steps, the higher your score! Each cell is a new frontier, and the longest path is the ultimate discovery. So put on your explorer hat, venture into the wilderness of cells, and extend your way to become the master of Cell-Extension!

### Cell-Division (different UI)
Dive into the riveting game of Cell-Division, where every connection is a chance for growth. In this game, players master the art of placement, skillfully positioning their cells on the grid. The thrill comes when your cells connect, horizontally, vertically, or diagonally, triggering a cascade of division and expansion. Each new cell adds to your score, and every cell you have on the board counts. So the strategy is clear: divide to conquer! Let your cells proliferate across the board, outgrow your opponents, and clinch the title of Cell-Division champion!


### Cell-Minimization
>Minimize the score of a random (or simple rule-based) opponent.