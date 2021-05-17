(function(){
  console.log("Hello maze");

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

  // functions
  function onCreateMaze() {
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

    // compute values of interest
    let itemWidth = 100 / mazeWidth;
    let itemHeight = 100 / mazeHeight;

    // create maze items
    for (let i = 0; i < mazeHeight; i++) {
      for (let j = 0; j < mazeWidth; j++) {
        let newItem = document.createElement("div");
        newItem.classList.add("item");
        newItem.style.width = itemWidth + "%";
        newItem.style.height = itemHeight + "%";
        newItem.id = `item-${j}-${i}`;

        // mark start
        if (j == mazeStartX && i == mazeStartY) {
          newItem.classList.add("start");
        }

        // mark end
        if (j == mazeEndX && i == mazeEndY) {
          newItem.classList.add("end");
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

      ++brickCount;
    }
  }

  // bindings
  buttonCreateMaze.onclick = onCreateMaze;
})();
