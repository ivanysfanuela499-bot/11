// Canvas and Context
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Paddle dimensions and properties
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 80;
const PADDLE_SPEED = 6;

// Ball properties
const BALL_SIZE = 8;
const INITIAL_BALL_SPEED = 4;
const MAX_BALL_SPEED = 8;

// Game objects
const player = {
    x: 10,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0,
    score: 0
};

const computer = {
    x: canvas.width - PADDLE_WIDTH - 10,
    y: canvas.height / 2 - PADDLE_HEIGHT / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dy: 0,
    score: 0
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: BALL_SIZE,
    dx: INITIAL_BALL_SPEED,
    dy: INITIAL_BALL_SPEED,
    speed: INITIAL_BALL_SPEED
};

// Input handling
const keys = {};
let mouseY = canvas.height / 2;

// Event listeners
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    if (e.key === ' ') {
        e.preventDefault();
        resetGame();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Update player paddle position (mouse and arrow keys)
function updatePlayerPaddle() {
    // Mouse control
    if (mouseY - PADDLE_HEIGHT / 2 > 0 && mouseY - PADDLE_HEIGHT / 2 < canvas.height - PADDLE_HEIGHT) {
        player.y = mouseY - PADDLE_HEIGHT / 2;
    }
    
    // Arrow keys control (overrides mouse if pressed)
    if (keys['ArrowUp'] && player.y > 0) {
        player.y -= PADDLE_SPEED;
    }
    if (keys['ArrowDown'] && player.y < canvas.height - PADDLE_HEIGHT) {
        player.y += PADDLE_SPEED;
    }
    
    // Boundary checking
    if (player.y < 0) player.y = 0;
    if (player.y > canvas.height - PADDLE_HEIGHT) player.y = canvas.height - PADDLE_HEIGHT;
}

// Update computer paddle position (AI)
function updateComputerPaddle() {
    const computerCenter = computer.y + PADDLE_HEIGHT / 2;
    const ballCenter = ball.y;
    const difficulty = 3.5; // AI speed (adjust for difficulty)
    
    // Simple AI: follow the ball
    if (computerCenter < ballCenter - 10) {
        computer.y += difficulty;
    } else if (computerCenter > ballCenter + 10) {
        computer.y -= difficulty;
    }
    
    // Boundary checking
    if (computer.y < 0) computer.y = 0;
    if (computer.y > canvas.height - PADDLE_HEIGHT) computer.y = canvas.height - PADDLE_HEIGHT;
}

// Update ball position
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Top and bottom wall collision
    if (ball.y - ball.size / 2 < 0) {
        ball.y = ball.size / 2;
        ball.dy = -ball.dy;
    }
    if (ball.y + ball.size / 2 > canvas.height) {
        ball.y = canvas.height - ball.size / 2;
        ball.dy = -ball.dy;
    }
    
    // Paddle collision - Player
    if (
        ball.x - ball.size / 2 < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.x = player.x + player.width + ball.size / 2;
        ball.dx = -ball.dx;
        
        // Add spin based on where the ball hits the paddle
        const hitPos = (ball.y - (player.y + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
        ball.dy = hitPos * ball.speed;
        
        // Increase speed slightly
        ball.speed = Math.min(ball.speed + 0.3, MAX_BALL_SPEED);
        ball.dx = Math.abs(ball.dx);
    }
    
    // Paddle collision - Computer
    if (
        ball.x + ball.size / 2 > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height
    ) {
        ball.x = computer.x - ball.size / 2;
        ball.dx = -ball.dx;
        
        // Add spin based on where the ball hits the paddle
        const hitPos = (ball.y - (computer.y + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
        ball.dy = hitPos * ball.speed;
        
        // Increase speed slightly
        ball.speed = Math.min(ball.speed + 0.3, MAX_BALL_SPEED);
        ball.dx = -Math.abs(ball.dx);
    }
    
    // Check if ball went out of bounds (left side)
    if (ball.x < 0) {
        computer.score++;
        updateScore();
        resetBall();
    }
    
    // Check if ball went out of bounds (right side)
    if (ball.x > canvas.width) {
        player.score++;
        updateScore();
        resetBall();
    }
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = INITIAL_BALL_SPEED;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * INITIAL_BALL_SPEED;
    ball.dy = (Math.random() - 0.5) * 2 * INITIAL_BALL_SPEED;
}

// Reset entire game
function resetGame() {
    player.score = 0;
    computer.score = 0;
    player.y = canvas.height / 2 - PADDLE_HEIGHT / 2;
    computer.y = canvas.height / 2 - PADDLE_HEIGHT / 2;
    resetBall();
    updateScore();
}

// Update score display
function updateScore() {
    document.getElementById('playerScore').textContent = player.score;
    document.getElementById('computerScore').textContent = computer.score;
}

// Draw rectangle
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

// Draw circle
function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

// Draw dashed center line
function drawCenterLine() {
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Render game
function draw() {
    // Clear canvas
    drawRect(0, 0, canvas.width, canvas.height, '#000');
    
    // Draw center line
    drawCenterLine();
    
    // Draw paddles
    drawRect(player.x, player.y, player.width, player.height, '#00ff00');
    drawRect(computer.x, computer.y, computer.width, computer.height, '#00ff00');
    
    // Draw ball
    drawCircle(ball.x, ball.y, ball.size / 2, '#00ff00');
}

// Game loop
function gameLoop() {
    updatePlayerPaddle();
    updateComputerPaddle();
    updateBall();
    draw();
    requestAnimationFrame(gameLoop);
}

// Initialize game
updateScore();
gameLoop();
