# Maze README

A Visual Studio Code extension to generate and solve mazes.  This was written as a project to learn the VS Code environment.

In the command pallete 

>  maze: generate 

and 

>  maze: solve

+ You can use the **Speed slider** to change the drawing rate during maze generation and solving.
+ You can use the **Cell Size slider** to change the size of a cell.
+ Press the **Finish Generation** button to solve the maze instantly.
+ Press **Start Solution** to start solving the maze.  If the maze is not done
  generating, then it will start the solution as soon as generation is complete.
+ Press **Finish Solution** to finish the solution instantly.

The maze adapts its drawing style as the size is changed.  Normally walls have a thickness greater than 1. When the cell size get's too small for the solution asterisk to
be readable, the wall size will be set to 1, and the asterisk will be replaced with a box.

## For Developers

The extension contains the maze generation and solution routines. The web view handles drawing the maze. 

An HTML canvas is used to draw the maze.  The size of the canvas is adjusted as the
user adjusts the cell size.

The extension, and the web view code are built using web pack.

During development use `npm run watch` to continuosly build with webpack.
When working on the tests use `npm run watch-tests` to continually build the tests
with `tsc`

Source code repository: [https://github.com/chgenly/vscode-maze](https://github.com/chgenly/vscode-maze)

License: MIT
