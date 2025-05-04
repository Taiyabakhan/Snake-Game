  (() => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const startButton = document.getElementById('start');
    const scoreDisplay = document.getElementById('score');
    const controlsInfo = document.getElementById('controls-info');

    // Game settings
    let tileCount = 25; // number of tiles in row and column
    let tileSize;       // computed size of each tile (based on canvas size)
    let snake, direction, food, score;
    let gameInterval;
    let speed = 100;    // game update interval in ms

    // Auto adjust tile size based on canvas width
    function updateTileSize() {
      tileSize = canvas.width / tileCount;
    }

    // Resize canvas maintaining square aspect ratio and adjust tile size
    function resizeCanvas() {
      const maxSize = Math.min(window.innerWidth * 0.9, 500);
      canvas.style.width = maxSize + 'px';
      canvas.style.height = maxSize + 'px';

      // Use CSS width/height to get displayed size
      const computedWidth = canvas.clientWidth;
      const computedHeight = canvas.clientHeight;

      canvas.width = computedWidth;
      canvas.height = computedHeight;

      updateTileSize();
    }

    // Initialize or reset game state
    function resetGame() {
      snake = [{ x: Math.floor(tileCount / 2), y: Math.floor(tileCount / 2) }];
      direction = { x: 0, y: 0 }; // Not moving initially
      placeFood();
      score = 0;
      updateScore();
    }

    // Place food on random location not occupied by snake
    function placeFood() {
      let newFood;
      do {
        newFood = {
          x: Math.floor(Math.random() * tileCount),
          y: Math.floor(Math.random() * tileCount),
        };
      } while (snake.some(seg => seg.x === newFood.x && seg.y === newFood.y));
      food = newFood;
    }

    // Draw everything on canvas
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw snake
      ctx.fillStyle = '#00FF00';
      snake.forEach(segment => {
        ctx.fillRect(segment.x * tileSize, segment.y * tileSize, tileSize * 0.9, tileSize * 0.9);
      });

      // Draw food
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(food.x * tileSize, food.y * tileSize, tileSize * 0.9, tileSize * 0.9);
    }

    // Move snake according to direction and update game state
    function moveSnake() {
      if (direction.x === 0 && direction.y === 0) return; // Not moving yet

      const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

      // Wall collisions wrap around (optional: else game over)
      // Uncomment below lines for wrap-around:
      // head.x = (head.x + tileCount) % tileCount;
      // head.y = (head.y + tileCount) % tileCount;

      // Check collisions with walls - game over
      if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
      }
      // Check collision with self
      if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
        gameOver();
        return;
      }

      snake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        score++;
        placeFood();
        updateScore();
      } else {
        snake.pop();
      }
    }

    function updateScore() {
      scoreDisplay.textContent = 'Score: ' + score;
    }

    function gameOver() {
      clearInterval(gameInterval);
      alert('Game Over! Your score: ' + score);
      startButton.textContent = 'RESTART';
      direction = { x: 0, y: 0 };
    }

    // Clear game and reset
    function startGame() {
      resetGame();
      if (gameInterval) clearInterval(gameInterval);
      gameInterval = setInterval(() => {
        moveSnake();
        draw();
      }, speed);
      direction = { x: 1, y: 0 }; // start moving right on start
      startButton.textContent = 'PLAYING...';
    }

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (direction.y !== 1) direction = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
          if (direction.y !== -1) direction = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
          if (direction.x !== 1) direction = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
          if (direction.x !== -1) direction = { x: 1, y: 0 };
          break;
      }
    });

    // Touch/swipe controls for mobile devices
    let touchStartX = 0;
    let touchStartY = 0;

    canvas.addEventListener('touchstart', e => {
      const touch = e.changedTouches[0];
      touchStartX = touch.screenX;
      touchStartY = touch.screenY;
    }, { passive: true });

    canvas.addEventListener('touchend', e => {
      const touch = e.changedTouches[0];
      const dx = touch.screenX - touchStartX;
      const dy = touch.screenY - touchStartY;

      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal swipe
        if (dx > 30 && direction.x !== -1) {
          direction = { x: 1, y: 0 };
        } else if (dx < -30 && direction.x !== 1) {
          direction = { x: -1, y: 0 };
        }
      } else {
        // Vertical swipe
        if (dy > 30 && direction.y !== -1) {
          direction = { x: 0, y: 1 };
        } else if (dy < -30 && direction.y !== 1) {
          direction = { x: 0, y: -1 };
        }
      }
    }, { passive: true });

    // Handle window resizing to keep canvas responsive
    window.addEventListener('resize', () => {
      resizeCanvas();
      draw();
    });

    // Start button click
    startButton.addEventListener('click', () => {
      startGame();
      canvas.focus();
    });

    // Initial setup
    resizeCanvas();
    resetGame();
  })();