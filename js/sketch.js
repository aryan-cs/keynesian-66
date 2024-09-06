let guesses = [];
let table;
let graphReady = false; // Control variable for when the graph should be drawn
let animationProgress = 0; // Track animation progress
const ANIMATION_DURATION = 2000; // Animation duration in milliseconds
const ANIMATION_INTERVAL = 5; // Interval between frames in milliseconds
let lastUpdateTime;

function preload() {
  defaultFont = loadFont("assets/fonts/default.ttf");

  // Load the guesses from the CSV file
  table = loadTable('assets/guesses.csv', 'csv', 'header');
}

function setup () {
  createCanvas(WIDTH, HEIGHT);
  createCornerButton("RUN");
  collectGuesses();
  
  graphReady = true; // Set the flag to true to draw the graph automatically
  lastUpdateTime = millis(); // Initialize last update time
  loop(); // Start the draw loop
}

function draw () {
  if (graphReady) {
    let currentTime = millis();
    let elapsedTime = currentTime - lastUpdateTime;

    if (elapsedTime >= ANIMATION_INTERVAL) {
      lastUpdateTime = currentTime;
      animationProgress = min(animationProgress + ANIMATION_INTERVAL / ANIMATION_DURATION, 1); // Update progress

      if (animationProgress >= 1) {
        animationProgress = 1; // Clamp progress to 1 when animation is done
        noLoop(); // Stop animating when done
      }
    }

    // Draw the graph with updated animation progress
    drawBarGraph();
  }
}

function collectGuesses() {
  guesses = []; // Ensure array is cleared to avoid duplicates

  // Limit to the first 30 responses, or fewer if less data is available
  for (let i = 0; i < table.getRowCount(); i++) {
    let guessValue = int(table.getString(i, 'guess'));
    if (guessValue >= 1 && guessValue <= 100) { // Ensure guesses are between 1 and 100
      guesses.push(guessValue);
    } else {
      console.warn(`Invalid guess: ${guessValue}`);
    }
  }

  // Sort guesses in ascending order (lowest to highest)
  guesses.sort((a, b) => a - b);
}

function drawBarGraph() {
  if (guesses.length === 0) {
    console.log("No valid guesses available to draw.");
    return;
  }

  background(255); // Clear the canvas
  
  let padding = 10; // Padding from the left and right sides
  let usableWidth = width - 2 * padding; // Width available for bars
  let numBars = 100; // Number of bars for each guess from 1 to 100
  let barWidth = usableWidth / numBars; // Width of each bar
  
  // Ensure bar width is not too small
  barWidth = Math.max(barWidth, 1);
  
  // Initialize an array to count occurrences for each value
  let counts = Array(numBars).fill(0);
  
  // Count occurrences for each guess
  for (let guess of guesses) {
    if (guess >= 1 && guess <= 100) {
      counts[guess - 1]++; // Increment count for the specific value
    }
  }

  // Draw bars
  for (let i = 0; i < numBars; i++) {
    let maxBarHeight = map(counts[i], 0, max(counts), 0, height - 70); // Map count to maximum bar height
    let barHeight = maxBarHeight * animationProgress; // Animate bar height
    
    strokeWeight(1); // Thinner border
    stroke(0, 0, 0, 150); // Translucent black (RGBA)
    fill(81, 211, 223); // Bar color
    let x = padding + i * barWidth; // Calculate x position with padding
    let y = height - barHeight - 30; // Adjust vertical position to move bars up
    rect(x, y, barWidth, barHeight); // Draw bar with animated height
    
    // Set custom font and larger text size for labels
    textFont(defaultFont); 
    textSize(18); // Increased text size by 4px
    fill(0); // Set label color to black
    textAlign(CENTER);
    
    // Display labels for specific values (1, 10, 20, ..., 100)
    let labelValue = i + 1; // Value for the current bar
    if (labelValue % 10 === 0 || labelValue === 1) {
      text(labelValue, x + barWidth / 2, height - 10); // Adjust label position to match bars
    }
  }
}
