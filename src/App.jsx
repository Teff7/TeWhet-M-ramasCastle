import { useEffect, useMemo, useState } from 'react'
import './App.css'

const resolveBoxes = (layout, desiredBoxes) => {
  const used = new Set()
  const isOpen = (row, col) =>
    layout[row] &&
    layout[row][col] &&
    layout[row][col] === '.'
  const addBox = (row, col) => {
    const key = `${row},${col}`
    used.add(key)
    return { row, col }
  }

  return desiredBoxes.map((box) => {
    const initialKey = `${box.row},${box.col}`
    if (isOpen(box.row, box.col) && !used.has(initialKey)) {
      return addBox(box.row, box.col)
    }

    const maxRadius = layout.length + layout[0].length
    for (let radius = 1; radius <= maxRadius; radius += 1) {
      for (let dr = -radius; dr <= radius; dr += 1) {
        const dc = radius - Math.abs(dr)
        const candidates = dc === 0 ? [0] : [dc, -dc]
        for (const offset of candidates) {
          const row = box.row + dr
          const col = box.col + offset
          const key = `${row},${col}`
          if (isOpen(row, col) && !used.has(key)) {
            return addBox(row, col)
          }
        }
      }
    }

    for (let row = 0; row < layout.length; row += 1) {
      for (let col = 0; col < layout[row].length; col += 1) {
        const key = `${row},${col}`
        if (isOpen(row, col) && !used.has(key)) {
          return addBox(row, col)
        }
      }
    }

    return addBox(box.row, box.col)
  })
}

const buildBlockedSet = (layout, boxes, start) => {
  const blocked = new Set()
  if (start) blocked.add(`${start.row},${start.col}`)
  boxes.forEach((box) => blocked.add(`${box.row},${box.col}`))
  for (let row = 0; row < layout.length; row += 1) {
    for (let col = 0; col < layout[row].length; col += 1) {
      const cell = layout[row][col]
      if (cell === 'E' || cell === 'S') {
        blocked.add(`${row},${col}`)
      }
    }
  }
  return blocked
}

const resolveTraps = (layout, desiredTraps, blockedSet) => {
  const used = new Set(blockedSet)
  const isOpen = (row, col) =>
    layout[row] &&
    layout[row][col] &&
    layout[row][col] === '.' &&
    !used.has(`${row},${col}`)
  const addTrap = (row, col) => {
    const key = `${row},${col}`
    used.add(key)
    return { row, col }
  }

  return desiredTraps.map((trap) => {
    if (isOpen(trap.row, trap.col)) {
      return addTrap(trap.row, trap.col)
    }

    const maxRadius = layout.length + layout[0].length
    for (let radius = 1; radius <= maxRadius; radius += 1) {
      for (let dr = -radius; dr <= radius; dr += 1) {
        const dc = radius - Math.abs(dr)
        const candidates = dc === 0 ? [0] : [dc, -dc]
        for (const offset of candidates) {
          const row = trap.row + dr
          const col = trap.col + offset
          if (isOpen(row, col)) {
            return addTrap(row, col)
          }
        }
      }
    }

    for (let row = 0; row < layout.length; row += 1) {
      for (let col = 0; col < layout[row].length; col += 1) {
        if (isOpen(row, col)) {
          return addTrap(row, col)
        }
      }
    }

    return addTrap(trap.row, trap.col)
  })
}

function App() {
  const [pos, setPos] = useState({ x: 50, y: 80 })
  const [doorOpen, setDoorOpen] = useState(false)
  const [mode, setMode] = useState('scene')
  const [level, setLevel] = useState(1)
  const [level4Unlocked, setLevel4Unlocked] = useState(false)
  const levels = useMemo(
    () => ({
      1: {
        layout: [
          '############',
          '#..#.......#',
          '#..#.####..#',
          '#.....#....#',
          '###.#.#.####',
          '#...#.#....#',
          '#.###.###..#',
          '#.#.....#..#',
          '#.#.###.#.##',
          '#...#...#..#',
          '#.........E#',
          '############',
        ],
        boxes: [
          { row: 9, col: 3 },
          { row: 7, col: 9 },
          { row: 4, col: 5 },
        ],
        requiredCoins: 3,
      },
      2: {
        layout: [
          '################',
          '#....#.....#...#',
          '#.##.#.###.#.#.#',
          '#.#..#...#...#.#',
          '#.#.###.#.###..#',
          '#.#.....#...#..#',
          '#.#####.###.#.##',
          '#.....#.....#..#',
          '###.#.#####.##.#',
          '#...#.....#....#',
          '#.#####.#.######',
          '#.....#.#......#',
          '#.###.#.####.#.#',
          '#...#...#..#.#E#',
          '#.#.###.#..#...#',
          '################',
        ],
        boxes: [
          { row: 1, col: 3 },
          { row: 3, col: 3 },
          { row: 5, col: 5 },
          { row: 7, col: 10 },
          { row: 13, col: 12 },
        ],
        requiredCoins: 5,
      },
      3: {
        layout: [
          '###################',
          '#...#.......#.....#',
          '#.#.#.#####.#.###.#',
          '#.#...#...#.#...#.#',
          '#.#####.#.#.###.#.#',
          '#.....#.#.#.....#.#',
          '###.#.#.#.#######.#',
          '#...#.#.#.....#...#',
          '#.###.#.#####.#.###',
          '#.#...#.....#.#...#',
          '#.#.#######.#.###.#',
          '#.#.....#...#...#.#',
          '#.#####.#.#####.#.#',
          '#.....#.#.....#.#.#',
          '#...#.#.###.#.#.#.#',
          '#.....#.....#...#E#',
          '###################',
        ],
        boxes: [
          { row: 1, col: 2 },
          { row: 3, col: 10 },
          { row: 5, col: 4 },
          { row: 7, col: 14 },
          { row: 9, col: 3 },
          { row: 11, col: 12 },
          { row: 13, col: 7 },
        ],
        requiredCoins: 7,
      },
      4: {
        layout: [
          '#########################',
          '#......................E#',
          '#.......................#',
          '#....#####..............#',
          '#....#...#..............#',
          '#....#...#......#####...#',
          '#....#...#......#...#...#',
          '#....#...#......#...#...#',
          '#....#####......#...#...#',
          '#...............#...#...#',
          '#...............#####...#',
          '#.......................#',
          '#.......................#',
          '#..####.................#',
          '#..#..#.................#',
          '#..####.................#',
          '#...............S.......#',
          '#.......................#',
          '#########################',
        ],
        boxes: [
          { row: 1, col: 2 },
          { row: 1, col: 20 },
          { row: 3, col: 8 },
          { row: 5, col: 14 },
          { row: 7, col: 3 },
          { row: 9, col: 18 },
          { row: 11, col: 2 },
          { row: 13, col: 10 },
          { row: 14, col: 16 },
          { row: 15, col: 6 },
          { row: 16, col: 12 },
          { row: 17, col: 4 },
        ],
        traps: [
          { row: 1, col: 6 },
          { row: 1, col: 12 },
          { row: 2, col: 4 },
          { row: 2, col: 9 },
          { row: 2, col: 14 },
          { row: 3, col: 2 },
          { row: 3, col: 16 },
          { row: 4, col: 6 },
          { row: 4, col: 20 },
          { row: 5, col: 4 },
          { row: 5, col: 18 },
          { row: 6, col: 8 },
          { row: 6, col: 14 },
          { row: 7, col: 20 },
          { row: 8, col: 4 },
          { row: 8, col: 12 },
          { row: 9, col: 6 },
          { row: 9, col: 22 },
          { row: 10, col: 8 },
          { row: 10, col: 16 },
          { row: 11, col: 14 },
          { row: 12, col: 6 },
          { row: 12, col: 20 },
          { row: 14, col: 8 },
          { row: 15, col: 20 },
        ],
        requiredCoins: 12,
        enemyStart: { row: 1, col: 22 },
      },
      5: {
        layout: [
          '#########################',
          '#...#.....#....#.......E#',
          '#.#.#.###.#.##.#.#####.##',
          '#.#...#...#....#.....#..#',
          '#.###.#.#####.###.###.#.#',
          '#.#...#.....#...#.....#.#',
          '#.#.#.#####.#.#.#####.#.#',
          '#.#.#.....#.#.#.....#.#.#',
          '#.#.#####.#.#.###.#.#.#.#',
          '#.#.....#.#...#...#.#...#',
          '#.#####.#.###.#.###.#.###',
          '#.#.....#.....#.....#...#',
          '#.#.###.#####.#.#####.#.#',
          '#.#...#.....#.#.....#.#.#',
          '#...#.#.###.#.###.#.....#',
          '#########################',
        ],
        boxes: [
          { row: 1, col: 2 },
          { row: 3, col: 6 },
          { row: 5, col: 10 },
          { row: 7, col: 14 },
          { row: 9, col: 18 },
          { row: 11, col: 6 },
          { row: 13, col: 10 },
        ],
        requiredCoins: 7,
      },
      6: {
        layout: [
          '#########################',
          '#......................E#',
          '#######################.#',
          '#.......................#',
          '#.#######################',
          '#.......................#',
          '#######################.#',
          '#.......................#',
          '#.#######################',
          '#.......................#',
          '#######################.#',
          '#.......................#',
          '#.#######################',
          '#.......................#',
          '#.......................#',
          '#########################',
        ],
        boxes: [
          { row: 1, col: 3 },
          { row: 3, col: 8 },
          { row: 5, col: 12 },
          { row: 7, col: 16 },
          { row: 9, col: 20 },
          { row: 11, col: 6 },
          { row: 13, col: 10 },
          { row: 14, col: 18 },
        ],
        requiredCoins: 8,
      },
    }),
    []
  )
  const currentLevel = levels[level] ?? levels[1]
  const mazeLayout = currentLevel.layout
  const requiredCoins = currentLevel.requiredCoins
  const maxLevel = Object.keys(levels).length
  const enemyStart = currentLevel.enemyStart ?? null
  const mazeStart = useMemo(
    () => ({
      row: mazeLayout.length - 2,
      col: 1,
    }),
    [mazeLayout]
  )
  const [mazePos, setMazePos] = useState(mazeStart)
  const [coins, setCoins] = useState(0)
  const maxLives = 5
  const [lives, setLives] = useState(maxLives)
  const [boxes, setBoxes] = useState(
    resolveBoxes(currentLevel.layout, currentLevel.boxes)
  )
  const [traps, setTraps] = useState([])
  const [revealedTraps, setRevealedTraps] = useState(new Set())
  const [enemyPos, setEnemyPos] = useState(currentLevel.enemyStart ?? null)
  const [mazeDir, setMazeDir] = useState('right')
  const [enemyDir, setEnemyDir] = useState('right')
  const [flashType, setFlashType] = useState(null)
  const [gameOver, setGameOver] = useState(false)
  const [win, setWin] = useState(false)

  const triggerFlash = (type) => {
    setFlashType(type)
    setTimeout(() => setFlashType(null), 200)
  }

  const resetGame = () => {
    const startLevel = levels[1]
    const startPos = {
      row: startLevel.layout.length - 2,
      col: 1,
    }
    const nextBoxes = resolveBoxes(startLevel.layout, startLevel.boxes)
    const blocked = buildBlockedSet(startLevel.layout, nextBoxes, startPos)
    setMode('scene')
    setLevel(1)
    setLevel4Unlocked(false)
    setPos({ x: 50, y: 80 })
    setCoins(0)
    setLives(maxLives)
    setMazePos(startPos)
    setBoxes(nextBoxes)
    setTraps(resolveTraps(startLevel.layout, startLevel.traps ?? [], blocked))
    setRevealedTraps(new Set())
    setEnemyPos(startLevel.enemyStart ?? null)
    setMazeDir('right')
    setEnemyDir('right')
    setGameOver(false)
    setWin(false)
  }

  useEffect(() => {
    const handleKey = (event) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key
      if (gameOver && (key === 'r' || key === 'enter')) {
        resetGame()
        return
      }
      if (win && (key === 'r' || key === 'enter')) {
        resetGame()
        return
      }
      if (gameOver) return
      if (win) return
      if (mode === 'scene') {
        const step = event.shiftKey ? 4 : 2
        setPos((current) => {
          let nextX = current.x
          let nextY = current.y

          if (key === 'ArrowLeft' || key === 'a') nextX -= step
          if (key === 'ArrowRight' || key === 'd') nextX += step
          if (key === 'ArrowUp' || key === 'w') nextY -= step
          if (key === 'ArrowDown' || key === 's') nextY += step

          return {
            x: Math.min(85, Math.max(15, nextX)),
            y: Math.min(90, Math.max(60, nextY)),
          }
        })
        return
      }

      if (mode === 'maze') {
        const allowedKeys = [
          'ArrowLeft',
          'ArrowRight',
          'ArrowUp',
          'ArrowDown',
          'w',
          'a',
          's',
          'd',
        ]
        if (!allowedKeys.includes(key)) {
          return
        }
        const moves = {
          ArrowLeft: { row: 0, col: -1 },
          ArrowRight: { row: 0, col: 1 },
          ArrowUp: { row: -1, col: 0 },
          ArrowDown: { row: 1, col: 0 },
          a: { row: 0, col: -1 },
          d: { row: 0, col: 1 },
          w: { row: -1, col: 0 },
          s: { row: 1, col: 0 },
        }
        const move = moves[key]
        const step = event.shiftKey ? 2 : 1

        if (move.col === -1) setMazeDir('left')
        if (move.col === 1) setMazeDir('right')
        if (move.row === -1) setMazeDir('up')
        if (move.row === 1) setMazeDir('down')

        setMazePos((current) => {
          let next = { ...current }
          for (let i = 0; i < step; i += 1) {
            const candidate = {
              row: next.row + move.row,
              col: next.col + move.col,
            }
            const row = mazeLayout[candidate.row]
            if (!row) return next
          const cell = row[candidate.col]
          if (cell === 'E' && coins < requiredCoins) return next
          if (cell !== '.' && cell !== 'E' && cell !== 'S') return next
          next = candidate
        }
        return next
      })
    }
  }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [mode, mazeLayout, coins, requiredCoins, gameOver])

  useEffect(() => {
    if (mode !== 'scene') return
    const isAtDoor =
      pos.x >= 46 &&
      pos.x <= 54 &&
      pos.y >= 63 &&
      pos.y <= 71
    setDoorOpen(level4Unlocked ? true : isAtDoor)
    if (isAtDoor) {
      const targetLevel = level === 3 && level4Unlocked ? 4 : level
      const targetData = levels[targetLevel] ?? levels[1]
      const startPos = {
        row: targetData.layout.length - 2,
        col: 1,
      }
      const nextBoxes = resolveBoxes(targetData.layout, targetData.boxes)
      const blocked = buildBlockedSet(targetData.layout, nextBoxes, startPos)
      const nextTraps = resolveTraps(
        targetData.layout,
        targetData.traps ?? [],
        blocked
      )
      setMode('maze')
      setLevel(targetLevel)
      setMazePos(startPos)
      setCoins(0)
      setLives(maxLives)
      setBoxes(nextBoxes)
      setTraps(nextTraps)
      setRevealedTraps(new Set())
      setMazeDir('right')
      setEnemyPos(targetData.enemyStart ?? null)
      setEnemyDir('right')
      setGameOver(false)
      setWin(false)
    }
  }, [pos, mode, level, level4Unlocked, levels])

  useEffect(() => {
    const startPos = {
      row: currentLevel.layout.length - 2,
      col: 1,
    }
    const nextBoxes = resolveBoxes(currentLevel.layout, currentLevel.boxes)
    const blocked = buildBlockedSet(currentLevel.layout, nextBoxes, startPos)
    setBoxes(nextBoxes)
    setTraps(
      resolveTraps(currentLevel.layout, currentLevel.traps ?? [], blocked)
    )
    setRevealedTraps(new Set())
    setLives(maxLives)
    setEnemyPos(currentLevel.enemyStart ?? null)
    setEnemyDir('right')
    setGameOver(false)
    setWin(false)
  }, [currentLevel])

  useEffect(() => {
    if (mode !== 'maze') return
    setBoxes((current) => {
      const hasBox = current.some(
        (box) => box.row === mazePos.row && box.col === mazePos.col
      )
      if (!hasBox) return current
      setCoins((coinsCount) => coinsCount + 1)
      return current.filter(
        (box) => box.row !== mazePos.row || box.col !== mazePos.col
      )
    })
  }, [mazePos, mode])

  useEffect(() => {
    if (mode !== 'maze' || level !== 4 || gameOver) return
    setTraps((current) => {
      const hasTrap = current.some(
        (trap) => trap.row === mazePos.row && trap.col === mazePos.col
      )
      if (!hasTrap) return current
      setLives((currentLives) => Math.max(0, currentLives - 1))
      setRevealedTraps((prev) => {
        const next = new Set(prev)
        next.add(`${mazePos.row},${mazePos.col}`)
        return next
      })
      triggerFlash('trap')
      return current.filter(
        (trap) => trap.row !== mazePos.row || trap.col !== mazePos.col
      )
    })
  }, [mazePos, mode, level, gameOver])

  useEffect(() => {
    if (mode !== 'maze') return
    if (mazeLayout[mazePos.row][mazePos.col] === 'S') {
      const nextData = levels[5]
      if (!nextData) return
      setLevel(5)
      setCoins(0)
      setBoxes(resolveBoxes(nextData.layout, nextData.boxes))
      setMazePos({
        row: nextData.layout.length - 2,
        col: 1,
      })
      setEnemyPos(nextData.enemyStart ?? null)
      setEnemyDir('right')
      setMazeDir('right')
      return
    }
    if (mazeLayout[mazePos.row][mazePos.col] !== 'E') return
    if (coins < requiredCoins) return

    if (level === 1 && level < maxLevel) {
      setMode('scene')
      setDoorOpen(false)
      setPos({ x: 50, y: 80 })
      setLevel(2)
      setEnemyPos(levels[2]?.enemyStart ?? null)
      setEnemyDir('right')
      setMazeDir('right')
      return
    }

    if (level === 3 && level < maxLevel) {
      const nextData = levels[4]
      setLevel(4)
      setCoins(0)
      setBoxes(resolveBoxes(nextData.layout, nextData.boxes))
      setMazePos({
        row: nextData.layout.length - 2,
        col: 1,
      })
      setEnemyPos(nextData.enemyStart ?? null)
      setEnemyDir('right')
      setMazeDir('right')
      return
    }

    if (level < maxLevel) {
      const nextLevel = level + 1
      const nextData = levels[nextLevel]
      setLevel(nextLevel)
      setCoins(0)
      setBoxes(resolveBoxes(nextData.layout, nextData.boxes))
      setMazePos({
        row: nextData.layout.length - 2,
        col: 1,
      })
      setEnemyPos(nextData.enemyStart ?? null)
      setEnemyDir('right')
      setMazeDir('right')
      return
    }

    setMode('win')
    setWin(true)
  }, [coins, mode, requiredCoins, level, maxLevel, levels, mazeLayout, mazePos])

  useEffect(() => {
    if (mode !== 'maze' || !enemyPos || gameOver) return

    const directions = ['right', 'down', 'left', 'up']
    const deltas = {
      right: { row: 0, col: 1 },
      down: { row: 1, col: 0 },
      left: { row: 0, col: -1 },
      up: { row: -1, col: 0 },
    }
    const nextDir = (dir) => directions[(directions.indexOf(dir) + 1) % 4]

    const interval = setInterval(() => {
      setEnemyPos((current) => {
        if (!current) return current
        let dir = enemyDir
        for (let i = 0; i < 4; i += 1) {
          const move = deltas[dir]
          const candidate = {
            row: current.row + move.row,
            col: current.col + move.col,
          }
          const row = mazeLayout[candidate.row]
          if (row && row[candidate.col] && row[candidate.col] !== '#') {
            if (dir !== enemyDir) {
              setEnemyDir(dir)
            }
            return candidate
          }
          dir = nextDir(dir)
        }

        return current
      })
    }, 350)

    return () => clearInterval(interval)
  }, [mode, enemyPos, mazeLayout, enemyDir, gameOver])

  useEffect(() => {
    if (mode !== 'maze' || !enemyPos || gameOver) return
    if (enemyPos.row === mazePos.row && enemyPos.col === mazePos.col) {
      setLives((currentLives) => Math.max(0, currentLives - 1))
      setMazePos(mazeStart)
      setEnemyPos(enemyStart)
      setEnemyDir('right')
      triggerFlash('enemy')
    }
  }, [enemyPos, mazePos, mode, mazeStart, enemyStart, gameOver])

  useEffect(() => {
    if (mode !== 'maze') return
    if (lives > 0) return
    setGameOver(true)
  }, [lives, mode])


  const eyePositions = useMemo(
    () =>
      Array.from({ length: 18 }, () => ({
        x: Math.random() * 100,
        y: 15 + Math.random() * 25,
        size: 6 + Math.random() * 10,
        delay: Math.random() * 3,
      })),
    []
  )

  if (mode === 'maze') {
    const isDarkLevel = level === 2
    return (
      <div
        className={`maze-screen ${flashType ? `maze-screen--flash-${flashType}` : ''}`}
      >
        <div className="maze-card">
          <div className="level-title">
            Level {level}: The Maze
            <span className="status-bar">
              <span className="coin-count">
                Coins: {coins} / {requiredCoins}{' '}
                {coins >= requiredCoins ? 'Gate open' : 'Gate locked'}
              </span>
              <span className="life-count">
                Lives:
                <span className="life-hearts">
                  {Array.from({ length: maxLives }).map((_, index) => (
                    <span
                      key={`life-${index}`}
                      className={`life-heart ${index < lives ? 'life-heart--full' : 'life-heart--empty'}`}
                    />
                  ))}
                </span>
              </span>
            </span>
          </div>
          <div
            className={`maze ${isDarkLevel ? 'maze--dark' : ''}`}
            style={{ '--maze-cols': mazeLayout[0].length }}
          >
            {mazeLayout.map((row, rowIndex) => (
              <div key={`row-${rowIndex}`} className="maze-row">
                {row.split('').map((cell, cellIndex) => {
                  const isPlayer =
                    mazePos.row === rowIndex && mazePos.col === cellIndex
                  const hasBox = boxes.some(
                    (box) => box.row === rowIndex && box.col === cellIndex
                  )
                  const isEnemy =
                    enemyPos &&
                    enemyPos.row === rowIndex &&
                    enemyPos.col === cellIndex
                  const isTrapVisible = revealedTraps.has(
                    `${rowIndex},${cellIndex}`
                  )
                  const cellClass =
                    cell === '#'
                      ? 'maze-wall'
                      : cell === 'E'
                        ? coins >= requiredCoins
                          ? 'maze-exit'
                          : 'maze-exit-locked'
                        : cell === 'S'
                          ? 'maze-secret'
                          : isPlayer
                            ? `maze-player maze-player--${mazeDir}`
                            : 'maze-path'
                  const distance = Math.max(
                    Math.abs(mazePos.row - rowIndex),
                    Math.abs(mazePos.col - cellIndex)
                  )
                  const visionClass = isDarkLevel
                    ? distance <= 1
                      ? 'maze-vision--bright'
                      : distance === 2
                        ? 'maze-vision--dim'
                        : 'maze-vision--hidden'
                    : ''
                  return (
                    <div
                      key={`cell-${rowIndex}-${cellIndex}`}
                      className={`maze-cell ${cellClass} ${hasBox ? 'maze-box' : ''} ${isTrapVisible ? 'maze-trap' : ''} ${isEnemy ? 'maze-enemy' : ''} ${visionClass}`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
        {gameOver ? (
          <div className="game-over">
            <div className="game-over-card">
              <div className="game-over-title">Game Over</div>
              <div className="game-over-text">Press R or Enter to restart</div>
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  if (mode === 'win') {
    return (
      <div className="win-screen">
        <div className="win-fireworks">
          <div className="firework firework--a" />
          <div className="firework firework--b" />
          <div className="firework firework--c" />
        </div>
        <div className="win-card">
          <div className="win-title">Mīharo!</div>
          <div className="win-text">
            You beat Te Whetū Mārama&apos;s Castle!
          </div>
          <div className="win-subtext">Press R or Enter to restart</div>
        </div>
      </div>
    )
  }

  return (
    <div className="scene">
      <div className="sky">
        <div className="stars" />
        <div className="moon" />
      </div>

      <div className="forest">
        <div className="tree-layer tree-layer--back" />
        <div className="tree-layer tree-layer--front" />
        <div className="eyes">
          {eyePositions.map((eye, index) => (
            <div
              key={`eye-${index}`}
              className="eye"
              style={{
                left: `${eye.x}%`,
                top: `${eye.y}%`,
                width: `${eye.size}px`,
                height: `${eye.size / 2}px`,
                animationDelay: `${eye.delay}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="castle">
        <div className="tower tower--left" />
        <div className="tower tower--right" />
        <div className="tower-lantern tower-lantern--left" />
        <div className="tower-lantern tower-lantern--right" />
        <div className="keep">
          <div className="banner" />
          <div className="castle-crest" />
          <div className="castle-flags">
            <div className="castle-flag" />
            <div className="castle-flag" />
          </div>
          <div className="castle-lights">
            <div className="castle-light" />
            <div className="castle-light" />
            <div className="castle-light" />
          </div>
          <div className={`gate ${doorOpen ? 'gate--open' : ''}`}>
            <div className="portcullis" />
          </div>
        </div>
        <div className="bridge">
          <div className="bridge-planks" />
        </div>
      </div>

      <div className="moat">
        <div className="crocodile croc--left" />
        <div className="crocodile croc--right" />
        <div className="fish fish--left" />
        <div className="fish fish--mid" />
        <div className="fish fish--right" />
        <div className="lantern lantern--left" />
        <div className="lantern lantern--mid" />
        <div className="lantern lantern--right" />
      </div>
      <div className="road" />

      <div
        className="hero"
        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
      >
        <div className="hero-cape" />
        <div className="hero-body" />
        <div className="hero-head" />
      </div>

      <div className="ground" />
    </div>
  )
}

export default App
