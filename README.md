# Cell-Collection

Players take turns placing their cells on the board. If a player places a new cell adjacent to one or more of their existing cells, their existing cells expand to include the new one.

Run the server locally:
```
python -m http.server
```
open the browser:
```
http://0.0.0.0:8000/
```


## Scoring Mechanisms

### Cell-Multiplication
> Product of the size (number of cells) of the connected components

### Cell-Connection
> Product of the number of directed edges (connections)

### Cell-Extension
> Product of the number of undirected edges (extensions)


