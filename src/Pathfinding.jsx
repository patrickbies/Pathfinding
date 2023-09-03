import React, { useEffect, useState } from "react";
import "./Pathfinding.css";

function Pathfinding(props) {
  const [grid, setGrid] = useState([]);
  const [selMode, setSelMode] = useState(1);
  const [alg, setAlg] = useState("BFS");
  const [pos, setPos] = useState([]);
  const [vis, setVis] = useState(false);
  const [maxDist, setMaxDist] = useState(-1);
  const [diag, setDiag] = useState(false);

  const speed = 0.005;

  const resetBoard = () => {
    setVis(false);
    setMaxDist(0);
    setPos([
      Math.floor(props.h / 2) * props.w + Math.floor(props.w * 0.25) - 1,
      Math.floor(props.h / 2) * props.w + Math.floor(props.w * 0.75) - 1,
    ]);

    setGrid(
      new Array(props.h)
        .fill(0)
        .map((row, y) =>
          new Array(props.w)
            .fill(0)
            .map((item, x) =>
              y === Math.floor(props.h / 2)
                ? x === Math.floor(props.w * 0.25) - 1
                  ? [2, 0]
                  : x === Math.floor(props.w * 0.75) - 1
                  ? [3, 0]
                  : [0, 0]
                : [0, 0]
            )
        )
    );
  };

  useEffect(() => resetBoard(), []);

  const changeTile = (val, x, y, np) => {
    if (
      !np ||
      (np && y * props.w + x !== pos[0] && y * props.w + x !== pos[1])
    ) {
      const new_grid = [...grid];
      new_grid[y][x] = val;
      setGrid(new_grid);
    }
  };

  const divide = (x, y, width, height, inc, res) => {
    if (width < 3 || height < 2) return;

    const orientation =
      width < height
        ? "h"
        : width > height
        ? "v"
        : Math.random() * 2 > 1
        ? "h"
        : "v";

    let div;
    div = Math.floor(
      orientation === "h"
        ? y + 1 + Math.random() * (height - 2)
        : x + 1 + Math.random() * (width - 2)
    );

    const door = !res
      ? orientation === "h"
        ? x
        : y
      : orientation === "h"
      ? x + width - 1
      : y + height - 1;

    for (
      let i = orientation === "h" ? x : y;
      i < (orientation === "h" ? width + x : height + y);
      i++
    ) {
      if (i !== door)
        changeTile(
          [1, inc],
          orientation === "h" ? i : div,
          orientation === "v" ? i : div,
          true
        );
      inc++;
    }

    // Horizontal Division:
    if (orientation === "h") {
      // ***div > y && div < (y + height)***
      divide(x, y, width, div - y, inc, !res);
      divide(x, div + 1, width, y + height - div - 1, inc, !res);
    }

    // Vertical Division:
    else {
      // ***div > x && div < (x + width)***
      divide(x, y, div - x, height, inc, !res);
      divide(div + 1, y, x + width - div - 1, height, inc, !res);
    }
  };

  const mazeHelper = () => {
    let increment = 0;

    setVis(false);
    grid.map((row, row_y) =>
      row.map((cell, row_x) => changeTile([0, 0, 0], row_x, row_y, true))
    );
    grid.map((row, row_y) => {
      row.map((cell, row_x) => {
        if ((row_x === 0 || row_x === props.w - 1) || (row_y === 0 || row_y === props.h - 1)) {
          changeTile([1, increment], row_x, row_y, true);
          increment++;
        }
      });
    });
    divide(1, 1, props.w - 2, props.h - 2, increment, Math.random() * 2 > 1);
  };

  const clearVis = () => {
    for (let y = 0; y < props.h; y++) {
      for (let x = 0; x < props.w; x++) {
        if (grid[y][x][0] >= 4 && grid[y][x][0] <= 7) {
          changeTile([0, 0], x, y);
        }
      }
    }
  };

  const genAdgList = (grid, isDiag) => {
    let adgList = new Array(props.w * props.h);

    for (let y = 0; y < props.h; y++) {
      for (let x = 0; x < props.w; x++) {
        let connections = [];

        let l = x - 1 >= 0,
          r = x + 1 <= props.w - 1,
          u = y - 1 >= 0,
          d = y + 1 <= props.h - 1;

        if (l && grid[y][x - 1][0] !== 1) connections.push(y * props.w + x - 1);
        if (r && grid[y][x + 1][0] !== 1) connections.push(y * props.w + x + 1);
        if (u && grid[y - 1][x][0] !== 1)
          connections.push((y - 1) * props.w + x);
        if (d && grid[y + 1][x][0] !== 1)
          connections.push((y + 1) * props.w + x);

        if (isDiag && l && u && grid[y - 1][x - 1][0] !== 1)
          connections.push((y - 1) * props.w + x - 1);
        if (isDiag && l && d && grid[y + 1][x - 1][0] !== 1)
          connections.push((y + 1) * props.w + x - 1);
        if (isDiag && r && u && grid[y - 1][x + 1][0] !== 1)
          connections.push((y - 1) * props.w + x + 1);
        if (isDiag && r && d && grid[y + 1][x + 1][0] !== 1)
          connections.push((y + 1) * props.w + x + 1);

        adgList[y * props.w + x] = connections;
      }
    }

    return adgList;
  };

  const BFS = (adj, start, finish, v, update) => {
    setVis(true);
    clearVis();

    let count = 0;

    let queue = [],
      visited = new Array(v).fill(false),
      dist = new Array(v).fill(16777215),
      pred = new Array(v).fill(-1);

    visited[start] = true;
    dist[start] = 0;
    queue.push(start);

    let found = false;

    while (queue.length > 0 && !found) {
      let curr_node = queue.shift();

      if (curr_node !== start && curr_node !== finish)
        changeTile(
          [update ? 6 : 4, update ? 0 : count],
          curr_node % props.w,
          Math.floor(curr_node / props.w)
        );

      count++;
      for (let i = 0; i < adj[curr_node].length; i++) {
        if (!visited[adj[curr_node][i]]) {
          visited[adj[curr_node][i]] = true;
          dist[adj[curr_node][i]] = dist[curr_node] + 1;
          pred[adj[curr_node][i]] = curr_node;

          queue.push(adj[curr_node][i]);

          if (adj[curr_node][i] === finish) {
            found = true;
            break;
          }
        }
      }
    }

    if (!found) return false;

    let c = finish;

    setMaxDist(count);

    while (pred[c] !== -1) {
      if (pred[c] !== start && pred[c] !== finish)
        changeTile(
          [update ? 7 : 5, update ? 0 : dist[pred[c]]],
          pred[c] % props.w,
          Math.floor(pred[c] / props.w)
        );
      c = pred[c];
    }
  };

  return (
    <div
      className="container"
      onMouseUp={() => {
        if (selMode === 2 || selMode === 3) setSelMode(1);
      }}
    >
      <h1>Pathfinding Algorithm Visualizer</h1>
      <div className="mode_selector">
        <div className="mode_selector_item" onClick={() => setSelMode(0)}>
          Erase
        </div>
        <div
          className="mode_selector_item"
          onClick={() => {
            resetBoard();
          }}
        >
          Reset Board
        </div>
        <div
          className="mode_selector_item"
          onClick={() => {
            clearVis();
            setVis(false);
          }}
        >
          Clear Path
        </div>
        <div
          className="mode_selector_item"
          onClick={() => {
            mazeHelper();
          }}
        >
          Generate Maze
        </div>
        <div className="mode_selector_item" onClick={() => setSelMode(1)}>
          Wall Node
        </div>
        <div
          className="mode_selector_item"
          onClick={() => {
            if (vis) {
              clearVis();
              BFS(
                genAdgList(grid, !diag),
                pos[0],
                pos[1],
                props.w * props.h,
                true
              );
            }
            setDiag(!diag);
          }}
          style={{ backgroundColor: diag ? "green" : "red", color: "white" }}
        >
          Allow Diagonal
        </div>
        <div
          className="mode_selector_item visualize_button"
          onClick={() => {
            BFS(
              genAdgList(grid, diag),
              pos[0],
              pos[1],
              props.w * props.h,
              false
            );
          }}
        >
          Visualize {alg}
        </div>
      </div>
      {grid.map((row, y) => (
        <div className="tile_row" key={y}>
          {row.map((item, x) => (
            <div
              className={`tile ${
                item[0] === 0
                  ? "empty"
                  : item[0] === 1
                  ? "wall"
                  : item[0] === 2
                  ? "start_node"
                  : item[0] === 3
                  ? "finish_node"
                  : item[0] === 4
                  ? "visited"
                  : item[0] === 5
                  ? "path"
                  : item[0] === 6
                  ? "update_visited"
                  : item[0] === 7
                  ? "update_path"
                  : ""
              }`}
              style={{
                animationDelay:
                  item[0] === 4
                    ? item[1] * speed + "s"
                    : item[0] === 5
                    ? item[1] * speed * 5 + maxDist * speed + "s"
                    : item[1] * speed * 5 + "s",
              }}
              key={y * props.h + x}
              onMouseOver={(e) => {
                if (e.buttons > 0 && (selMode === 2 || selMode === 3)) {
                  let new_pos =
                    selMode === 2
                      ? [y * props.w + x, pos[1]]
                      : [pos[0], y * props.w + x];

                  setPos(new_pos);
                  changeTile([selMode, 0, item[0]], x, y);

                  if (vis) {
                    clearVis();
                    BFS(
                      genAdgList(grid),
                      new_pos[0],
                      new_pos[1],
                      props.w * props.h,
                      true
                    );
                  }
                } else if (e.buttons > 0 && item[0] !== 2 && item[0] !== 3) {
                  changeTile([selMode, 0], x, y);
                  if (vis) {
                    BFS(
                      genAdgList(grid),
                      pos[0],
                      pos[1],
                      props.w * props.h,
                      true
                    );
                  }
                }
              }}
              onMouseLeave={(e) => {
                if (e.buttons > 0 && (selMode === 2 || selMode === 3)) {
                  changeTile([item[2], 0], x, y);
                }
              }}
              onMouseDown={() => {
                if (item[0] === 2 || item[0] === 3) {
                  setSelMode(item[0]);
                } else {
                  changeTile([selMode, 0], x, y);
                  if (vis) {
                    BFS(
                      genAdgList(grid),
                      pos[0],
                      pos[1],
                      props.w * props.h,
                      true
                    );
                  }
                }
              }}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default Pathfinding;
