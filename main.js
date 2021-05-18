(function(){
  console.log("Hello maze");

  // definitions
  const CellType = Object.freeze({
    EMPTY: 0,
    BRICK: 1,
    START: 2,
    END: 3,
  });

  class MazeStats {
    constructor(
      mazeWidth, mazeHeight, mazeStartX, mazeStartY, mazeEndX, mazeEndY
    ) {
      this.mazeWidth = mazeWidth,
      this.mazeHeight = mazeHeight,
      this.mazeStartX = mazeStartX,
      this.mazeStartY = mazeStartY,
      this.mazeEndX = mazeEndX,
      this.mazeEndY = mazeEndY
    }
  }

  // declarations
  let buttonCreateMaze = document.querySelector("#createMaze");

  let mazeWidthInput = document.querySelector("#mazeWidth");
  let mazeHeightInput = document.querySelector("#mazeHeight");
  let mazeStartXInput = document.querySelector("#mazeStartX");
  let mazeStartYInput = document.querySelector("#mazeStartY");
  let mazeEndXInput = document.querySelector("#mazeEndX");
  let mazeEndYInput = document.querySelector("#mazeEndY");
  let brickDensityInput = document.querySelector("#brickDensity");

  let maze = document.querySelector("#maze");

  let mazeCells = {};

  // functions
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function findSolutions(
    currentCell, mazeStats, mazeCells, visited, currentPath, nonsolutionVisited
  ) {

    if (
      !(
        currentCell[0] == mazeStats.mazeStartX &&
        currentCell[1] == mazeStats.mazeStartY
      )
    )
      currentPath = [...currentPath, currentCell];

    // initialize visit matrix
    if (visited == null) {
      visited = {};

      for (let i = 0; i < mazeStats.mazeWidth; ++i) {
        visited[i] = Array.from({length: mazeStats.mazeHeight}, () => 0);
      }
    } else {
      // or just copy
      visited = _.cloneDeep(visited);
    }

    if (nonsolutionVisited == null) {
      nonsolutionVisited = {};

      for (let i = 0; i < mazeStats.mazeWidth; ++i) {
        nonsolutionVisited[i] = Array.from({length: mazeStats.mazeHeight}, () => 0);
      }
    }

    // mark as visited
    visited[currentCell[0]][currentCell[1]] = 1;

    adjacentCells = [
      [currentCell[0], currentCell[1] - 1], // top
      [currentCell[0] + 1, currentCell[1]], // right
      [currentCell[0], currentCell[1] + 1], // bottom
      [currentCell[0] - 1, currentCell[1]], // left
    ];

    let solutions = [];
    let solutionsFromCell = null;

    const currentNode = document.querySelector(
      `#item-${currentCell[0]}-${currentCell[1]}`
    );

    currentNode.classList.add("seek");

    let currentCellSolutions = [];

    for (let nextCell of adjacentCells) {

      if (
        nextCell[0] < 0 || nextCell[0] >= mazeStats.mazeWidth ||
        nextCell[1] < 0 || nextCell[1] >= mazeStats.mazeHeight ||
        mazeCells[nextCell[0]][nextCell[1]] == CellType.BRICK ||
        mazeCells[nextCell[0]][nextCell[1]] == CellType.START ||
        visited[nextCell[0]][nextCell[1]] == 1
        // nonsolutionVisited[nextCell[0]][nextCell[1]] == 1
      ) continue;

      if (mazeCells[nextCell[0]][nextCell[1]] == CellType.END)
        solutions = [...solutions, currentPath];

      solutionsFromCell = await findSolutions(
        nextCell, mazeStats, mazeCells, visited, currentPath, nonsolutionVisited
      );

      if (solutionsFromCell != null) {
        currentCellSolutions = [...currentCellSolutions, ...solutionsFromCell];
      }
    }

    if (currentCellSolutions.length > 0) {
      solutions = [...solutions, ...currentCellSolutions];
    } else {
      nonsolutionVisited[currentCell[0]][currentCell[1]] = 1;
    }


    await sleep(10);

    currentNode.classList.remove("seek");

    return solutions;
  }

  async function onCreateMaze() {
    // clear current items
    let items = document.querySelectorAll(".item");
    items.forEach(function(elem) {
      elem.remove();
    })

    // gather values in form
    let mazeWidth = Number(mazeWidthInput.value);
    let mazeHeight = Number(mazeHeightInput.value);
    let mazeStartX = Number(mazeStartXInput.value) - 1;
    let mazeStartY = Number(mazeStartYInput.value) - 1;
    let mazeEndX = Number(mazeEndXInput.value) - 1;
    let mazeEndY = Number(mazeEndYInput.value) - 1;
    let brickDensity = Number(brickDensityInput.value);

    const mazeStats = new MazeStats(
      mazeWidth, mazeHeight, mazeStartX, mazeStartY, mazeEndX, mazeEndY
    );

    // compute values of interest
    let itemWidth = 100 / mazeWidth;
    let itemHeight = 100 / mazeHeight;

    // define maze cells matrix
    for (let i = 0; i < mazeStats.mazeWidth; ++i) {
      mazeCells[i] = Array.from(
        {length: mazeStats.mazeHeight},
        () => CellType.EMPTY
      );
    }
    mazeCells[mazeStats.mazeStartX][mazeStats.mazeStartY] = CellType.START;
    mazeCells[mazeStats.mazeEndX][mazeStats.mazeEndY] = CellType.END;

    // create maze items
    for (let i = 0; i < mazeHeight; i++) {
      for (let j = 0; j < mazeWidth; j++) {
        let newItem = document.createElement("div");
        newItem.classList.add("item");
        newItem.style.width = itemWidth + "%";
        newItem.style.height = itemHeight + "%";
        newItem.id = `item-${j}-${i}`;
        newItem.dataset.cellType = CellType.EMPTY;

        // mark start
        if (j == mazeStartX && i == mazeStartY) {
          newItem.classList.add("start");
          newItem.dataset.cellType = CellType.START;
        }

        // mark end
        if (j == mazeEndX && i == mazeEndY) {
          newItem.classList.add("end");
          newItem.dataset.cellType = CellType.END;
        }

        maze.appendChild(newItem);
      }
    }

    // create bricks
    let potentialBricks = [];

    for (let x = 0; x < mazeWidth; ++x) {
      for (let y = 0; y < mazeHeight; ++y) {
        if (
          x == mazeStartX && y == mazeStartY ||
          x == mazeEndX && y == mazeEndY
        ) continue;
        potentialBricks.push([x, y]);
      }
    }

    let brickCount = 0;
    let maxBricks = Math.round( (brickDensity * potentialBricks.length) / 100);
    while (brickCount < maxBricks) {
      let randomItemIndex = Math.floor(Math.random() * potentialBricks.length);
      let randomItem = potentialBricks.splice(randomItemIndex, 1)[0];
      let randomX = randomItem[0];
      let randomY = randomItem[1];

      let newBrick = document.querySelector(`#item-${randomX}-${randomY}`);
      newBrick.classList.add("brick");
      newBrick.dataset.cellType = CellType.BRICK;

      mazeCells[randomX][randomY] = CellType.BRICK;

      ++brickCount;
    }

    // find solution
    let solutions = await findSolutions(
      [mazeStats.mazeStartX, mazeStats.mazeStartY],
      mazeStats,
      mazeCells,
      null,
      [], // current path,
      null
    );

    if (solutions.length) {
      console.log("Solutions found");
      solutions = _.sortBy(solutions, (s) => s.length);
      let ultimateSolution = solutions.slice(0, 1)[0];

      for (let pathCell of ultimateSolution) {
        let pathNode = document.querySelector(`#item-${pathCell[0]}-${pathCell[1]}`);
        pathNode.classList.add("path-node");
      }

    } else {
      console.log("No solutions");
      let emptyItems = document.querySelectorAll(`.item[data-cell-type="${CellType.EMPTY}"]`);

      for (let item of emptyItems) {
        item.classList.add("danger");
      }
    }
  }

  // bindings
  buttonCreateMaze.onclick = onCreateMaze;
})();
