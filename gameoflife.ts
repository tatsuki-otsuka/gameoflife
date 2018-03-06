// John Conway's Game of Life Implemented with TypeScript
// Created In March 2018

enum CellState {
  Live,
  Die
}

enum CellExistence {
  HasExisted,
  YetToExist
}

enum PlayState {
  Play,
  Pause
}

interface ICellPresets {
  [key: string]: Array<Array<number>>;
}

const cellPresets: ICellPresets = {
  galaxy: [
    [1, 1, 0, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 0, 1, 1]
  ],
  rPentomino: [[0, 1, 1], [1, 1, 0], [0, 1, 0]],
  blinker: [[1, 1, 1]],
  toad: [[0, 1, 1, 1], [1, 1, 1, 0]],
  pulser: [
    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0]
  ],
  pentadecathlon: [
    [0, 1, 0],
    [0, 1, 0],
    [1, 0, 1],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
    [1, 0, 1],
    [0, 1, 0],
    [0, 1, 0]
  ],
  glider: [[1, 1, 1], [1, 0, 0], [0, 1, 0]],
  lightweightSpaceship: [
    [0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0]
  ],
  middleweightSpaceship: [
    [0, 0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 0]
  ],
  heavyweightSpaceship: [
    [0, 0, 0, 1, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 0]
  ],
  acorn: [[0, 1, 0, 0, 0, 0, 0], [0, 0, 0, 1, 0, 0, 0], [1, 1, 0, 0, 1, 1, 1]],
  dieHard: [
    [0, 0, 0, 0, 0, 0, 1, 0],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 1, 1, 1]
  ]
};

class GameOfLife {
  // Canvas element
  private canvas: HTMLCanvasElement;

  // Resolution for Retina displays
  private res: number = 4;

  // Canvas context
  private context: any;

  // Grid size
  private size: number;

  // Number of initial cells
  private initialCells: number;

  // Cell map
  public cellMap: Array<Array<Array<any>>> = [[]];

  // Animation timer
  private timer: any;

  // Current generation
  public generation: number = 1;

  // Generation container
  public generationElement: HTMLElement;

  // The current player status
  public playState: PlayState = PlayState.Pause;

  /**
   *
   * @param canvas
   * @param size
   * @param initialCells
   */
  constructor(
    canvas: HTMLElement,
    generationElement: HTMLElement,
    size: number,
    initialCells: number
  ) {
    this.canvas = <HTMLCanvasElement>canvas;
    this.generationElement = generationElement;

    this.context = this.canvas.getContext("2d");

    // Adjust resolution for high-res displays
    this.res = window.devicePixelRatio || 1;
    console.info("Device Pixel Resolution:", this.res);
    console.info("Device Screen Width:", window.parent.screen.width);

    if (window.parent.screen.width < 768) {
      this.canvas.width = Math.floor(window.parent.screen.width / 100) * 100;
      this.canvas.height = this.canvas.width;
    }

    this.canvas.style.width = `${this.canvas.width}px`;
    this.canvas.style.height = `${this.canvas.height}px`;

    this.canvas.width *= this.res;
    this.canvas.height *= this.res;

    this.size = size * this.res;
    this.initialCells = initialCells;

    /*
      Initialize cellMap
      * S is either CellState.Die or CellState.Live
      [
        [S, S, S, S, ..., S],
        [S, S, S, S, ..., S],
        [S, S, S, S, ..., S],
        ...
        [S, S, S, S, ..., S]
      ]
    */
    this.initializeCellMap();
  }

  /** Initializes(resets) the cell map and the generation counter. */
  public initializeCellMap() {
    this.cellMap = Array.from(
      { length: this.canvas.height / this.size * 3 },
      e =>
        Array.from({ length: this.canvas.width / this.size * 3 }, e => [
          CellState.Die,
          CellExistence.YetToExist
        ])
    );

    this.step();
    this.generation = 1;
    this.generationElement.innerHTML = this.generation.toString();
  }

  /** Find the nearest cell coordinate. */
  public nearestCellCoord(x: number, y: number): { x: number; y: number } {
    const nearestX = this.canvas.width / this.size + Math.floor(x / this.size * this.res);
    const nearestY = this.canvas.width / this.size + Math.floor(y / this.size * this.res);
    return { x: nearestX, y: nearestY };
  }

  /**
   * Places a cell on the nearest coordinate clicked.
   * @param e MouseEvents
   */
  public placeCell(e: MouseEvent) {
    const clickX = e.pageX;
    const clickY = e.pageY;

    // Get absolute positions for the canvas element
    const clientRect = this.canvas.getBoundingClientRect();
    const posX = clientRect.left + window.pageXOffset;
    const posY = clientRect.top + window.pageYOffset;

    const x = clickX - posX;
    const y = clickY - posY;

    // Find the nearest cell coordinate
    const coord = this.nearestCellCoord(x, y);
    console.log(x, y);
    console.log(coord);

    // Update state
    if (this.cellMap[coord.y][coord.x][0] == CellState.Live) {
      this.update(coord.x, coord.y, CellState.Die, this.cellMap, false);
    } else {
      this.update(coord.x, coord.y, CellState.Live, this.cellMap, false);
    }
  }

  public loadPreset(preset: Array<Array<number>>) {
    const cellWidth = this.canvas.width / this.size;
    const cellHeight = this.canvas.height / this.size;
    const marginX: number =
      cellWidth + Math.floor((cellWidth - preset[0].length) / 2);
    const marginY: number =
      cellHeight + Math.floor((cellHeight - preset.length) / 2);

    this.initializeCellMap();
    for (let y = 0; y < preset.length; y++) {
      for (let x = 0; x < preset[0].length; x++) {
        let cellState: CellState = preset[y][x]
          ? CellState.Live
          : CellState.Die;
        this.update(marginX + x, marginY + y, cellState, this.cellMap, false);
      }
    }
  }

  /** Draws grid. */
  public drawGrid() {
    const _fix = 0.5;

    this.context.beginPath();
    this.context.strokeStyle = "rgb(150, 150, 150)";
    this.context.lineWidth = 1;

    // Vertical grids
    for (let i = 0; i * this.size <= this.canvas.width; i++) {
      let beginX = i * this.size;

      this.context.moveTo(beginX, 0);
      this.context.lineTo(beginX, this.canvas.height);
    }

    // Horizontal grids
    for (let i = 0; i * this.size <= this.canvas.height; i++) {
      let beginY = i * this.size;

      this.context.moveTo(0, beginY);
      this.context.lineTo(this.canvas.width, beginY);
    }

    this.context.closePath();
    this.context.stroke();
  }

  /** Initializes cells. */
  public initialize() {
    // Draw grid
    this.drawGrid();

    // Place a cell when clicked
    this.canvas.addEventListener(
      "click",
      (e: MouseEvent) => {
        this.placeCell(e);
      },
      false
    );
  }

  /**
   * Plays Game of Life.
   * @param speed Play speed in milli seconds.
   */
  public play(speed: number = 100) {
    if (this.playState == PlayState.Pause) {
      this.timer = setInterval(() => {
        this.generationElement.innerHTML = this.generation.toString();
        this.step();
      }, speed);
      this.playState = PlayState.Play;
    }
  }

  /** Pauses Game pf Life. */
  public pause() {
    if (this.playState == PlayState.Play) {
      clearInterval(this.timer);
      this.playState = PlayState.Pause;
    }
  }

  /** Progresses Game of Life one step forward. */
  public step() {
    let survive = 0;
    let newCellMap = this.copyCellMap(this.cellMap);

    for (let i = 0; i < this.cellMap[0].length; i++) {
      for (let j = 0; j < this.cellMap.length; j++) {
        const neighbors = this.liveNeighbors(i, j);

        if (this.cellMap[j][i][0] == CellState.Die && neighbors == 3) {
          this.update(i, j, CellState.Live, newCellMap);
          survive = 1;
        } else if (this.cellMap[j][i][0] == CellState.Live && neighbors <= 1) {
          this.update(i, j, CellState.Die, newCellMap);
        } else if (
          this.cellMap[j][i][0] == CellState.Live &&
          neighbors >= 2 &&
          neighbors <= 3
        ) {
          this.update(i, j, CellState.Live, newCellMap);
          survive = 1;
        } else if (this.cellMap[j][i][0] == CellState.Live && neighbors >= 4) {
          this.update(i, j, CellState.Die, newCellMap);
        } else {
          this.update(i, j, this.cellMap[j][i][0], newCellMap);
          if (this.cellMap[j][i][0] == CellState.Live) {
            survive = 1;
          }
        }
      }
    }

    this.cellMap = newCellMap;

    // Survive if at least one cell changed.
    if (survive) {
      this.generation++;
    } else {
      this.pause();
    }
  }

  /**
   * Deep copies cell map.
   * @param map Cell map array.
   */
  public copyCellMap(map: Array<Array<Array<any>>>) {
    let newCellMap = [];
    for (let l of map) {
      let line = [];
      for (let c of l) {
        let eachCellState = [];
        for (let k of c) {
          eachCellState.push(k);
        }
        line.push(eachCellState);
      }
      newCellMap.push(line);
    }

    return newCellMap;
  }

  /**
   * Updates cell states and canvas.
   * @param x The X coordinate for the cell to update.
   * @param y The Y coordinate for the cell to update.
   * @param state The new cell state, either CellState.Live or CellState.Die.
   * @param map The cell map array.
   */
  public update(
    x: number,
    y: number,
    state: CellState,
    map: Array<Array<Array<any>>>,
    updateExistenceState: boolean = true
  ) {
    // If coordinate X is larger than the maximum X value
    if (x < 0 || x > this.cellMap[0].length) {
      throw "Invalid x coordinate.";
      // If coordinate Y is larger than the maximum Y value
    } else if (y < 0 || y > this.cellMap.length) {
      throw "Invalid y coordinate.";
    }

    this.context.lineWidth = 1;
    let beginX =
      (x - this.canvas.width / this.size) * this.size +
      this.context.lineWidth * 2;
    let beginY =
      (y - this.canvas.width / this.size) * this.size +
      this.context.lineWidth * 2;
    let sizeX = this.size - this.context.lineWidth * 4;
    let sizeY = this.size - this.context.lineWidth * 4;

    if (state == CellState.Live) {
      if (beginX >= 0 && beginY >= 0) {
        this.context.beginPath();
        this.context.fillStyle = "rgb(0, 0, 0)";
        this.context.fillRect(beginX, beginY, sizeX, sizeY);
      }
      map[y][x][0] = CellState.Live;
      if (updateExistenceState) {
        map[y][x][1] = CellExistence.HasExisted;
      }
    } else {
      if (beginX >= 0 && beginY >= 0) {
        this.context.beginPath();
        if (map[y][x][1] == CellExistence.HasExisted) {
          this.context.fillStyle = "rgb(253, 203, 110)";
          this.context.fillRect(beginX, beginY, sizeX, sizeY);
        } else {
          this.context.clearRect(beginX, beginY, sizeX, sizeY);
        }
      }
      map[y][x][0] = CellState.Die;
    }
  }

  /**
   * Returns the number of neighboring live cells.
   * @param x The X coordinate of the cell of interest.
   * @param y The Y coordinate of the cell of interest.
   */
  public liveNeighbors(x: number, y: number): number {
    let neighbors = 0;

    /*
      There are 8 neighboring cells at largest.
      [1][2][3]
      [4][x][5]
      [6][7][8]
    */

    // [1]
    if (y >= 1 && x >= 1 && this.cellMap[y - 1][x - 1][0] == CellState.Live) {
      neighbors++;
    }

    // [2]
    if (y >= 1 && this.cellMap[y - 1][x][0] == CellState.Live) {
      neighbors++;
    }

    // [3]
    if (
      y >= 1 &&
      this.cellMap[y].length - 1 >= x + 1 &&
      this.cellMap[y - 1][x + 1][0] == CellState.Live
    ) {
      neighbors++;
    }

    // [4]
    if (x >= 1 && this.cellMap[y][x - 1][0] == CellState.Live) {
      neighbors++;
    }

    // [5]
    if (
      this.cellMap[y].length - 1 >= x + 1 &&
      this.cellMap[y][x + 1][0] == CellState.Live
    ) {
      neighbors++;
    }

    // [6]
    if (
      x >= 1 &&
      this.cellMap.length - 1 >= y + 1 &&
      this.cellMap[y + 1][x - 1][0] == CellState.Live
    ) {
      neighbors++;
    }

    // [7]
    if (
      this.cellMap.length - 1 >= y + 1 &&
      this.cellMap[y + 1][x][0] == CellState.Live
    ) {
      neighbors++;
    }

    // [8]
    if (
      this.cellMap[y].length - 1 >= x + 1 &&
      this.cellMap.length - 1 >= y + 1 &&
      this.cellMap[y + 1][x + 1][0] == CellState.Live
    ) {
      neighbors++;
    }

    return neighbors;
  }
}

// Simulate an GOL
document.addEventListener(
  "DOMContentLoaded",
  () => {
    const GOL = new GameOfLife(
      document.getElementById("gameoflife")!,
      document.getElementById("current-generation")!,
      10,
      50
    );
    GOL.initialize();

    document.getElementById("play")!.addEventListener(
      "click",
      () => {
        GOL.play();
      },
      false
    );

    document.getElementById("pause")!.addEventListener(
      "click",
      () => {
        GOL.pause();
      },
      false
    );

    document.getElementById("reset")!.addEventListener(
      "click",
      () => {
        GOL.initializeCellMap();
      },
      false
    );

    document.getElementById("presets")!.addEventListener(
      "change",
      () => {
        GOL.loadPreset(
          cellPresets[
            (<HTMLInputElement>document.getElementById("presets")).value
          ]
        );
      },
      false
    );
  },
  false
);
