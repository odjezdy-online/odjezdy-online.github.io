const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set up the game objects
const puck = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 10,
  speed: 5,
  velocity: { x: 0, y: 0 }
};

const player1 = {
  x: 50,
  y: canvas.height / 2,
  width: 20,
  height: 100,
  speed: 3,
  velocity: { x: 0, y: 0 }
};

const player2 = {
  x: canvas.width - 50,
  y: canvas.height / 2,
  width: 20,
  height: 100,
  speed: 3,
  velocity: { x: 0, y: 0 }
};

// Set up the event listener for the player striker
document.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const root = document.documentElement;
  const mouseX = e.clientX - rect.left - root.scrollLeft;
  const mouseY = e.clientY - rect.top - root.scrollTop;
  player1.y = mouseY;
});

// Set up the game loop
function animate() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the game objects
  drawPuck(puck);
  drawPlayer(player1);
  drawPlayer(player2);

  // Update the game objects
  updatePuck(puck);
  updatePlayer(player1);
  updatePlayer(player2);

  // Call the animate function again on the next frame
  requestAnimationFrame(animate);
}

// Call the animate function to start the game loop
animate();

// Define the draw functions
function drawPuck(puck) {
  ctx.beginPath();
  ctx.arc(puck.x, puck.y, puck.radius, 0, Math.PI * 2);
  ctx.fillStyle = 'white';
  ctx.fill();
  ctx.closePath();
}

function drawPlayer(player) {
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Define the update functions
function updatePuck(puck) {
  // Update the puck's position based on its velocity
  puck.x += puck.velocity.x;
  puck.y += puck.velocity.y;

  // Check for collisions with the players
  if (
    Math.abs(puck.x - player1.x - player1.width / 2) <
      puck.radius + player1.width / 2 &&
    Math.abs(puck.y - player1.y - player1.height / 2) <
      puck.radius + player1.height / 2
  ) {
    // Reverse the puck'svelocity if it collides with player 1
    puck.velocity.x = -puck.speed;
  }

  if (
    Math.abs(puck.x - player2.x - player2.width / 2) <
      puck.radius + player2.width / 2 &&
    Math.abs(puck.y - player2.y - player2.height / 2) <
      puck.radius + player2.height / 2
  ) {
    // Reverse the puck's velocity if it collides with player 2
    puck.velocity.x = puck.speed;
  }

  // Check for collisions with the canvas edges
  if (puck.x - puck.radius < 0 || puck.x + puck.radius > canvas.width) {
    // Reverse the puck's velocity if it collides with the canvas edges
    puck.velocity.x = -puck.velocity.x;
  }

  if (puck.y - puck.radius < 0 || puck.y + puck.radius > canvas.height) {
    // Reverse the puck's velocity if it collides with the canvas edges
    puck.velocity.y = -puck.velocity.y;
  }
}

function updatePlayer(player) {
  // Update the player's position based on its velocity
  player.y += player.velocity.y;

  // Check for collisions with the canvas edges
  if (player.y - player.height / 2 < 0) {
    // Move the player back to the top of the canvas if it collides with the top edge
    player.y = player.height / 2;
  }

  if (player.y + player.height / 2 > canvas.height) {
    // Move the player back to the bottom of the canvas if it collides with the bottom edge
    player.y = canvas.height - player.height / 2;
  }
}
