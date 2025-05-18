import fs from "fs";
import { createCanvas } from "canvas";

const characters = [
  { name: "Totoro", color: "#4CAF50" },
  { name: "Sophie", color: "#2196F3" },
  { name: "Ponyo", color: "#FF9800" },
  { name: "Chihiro", color: "#9C27B0" },
  { name: "Kiki", color: "#E91E63" },
  { name: "Howl", color: "#607D8B" },
];

// Create images directory if it doesn't exist
if (!fs.existsSync("./images")) {
  fs.mkdirSync("./images");
}

characters.forEach((character) => {
  // Create a canvas
  const canvas = createCanvas(400, 400);
  const ctx = canvas.getContext("2d");

  // Fill background
  ctx.fillStyle = character.color;
  ctx.fillRect(0, 0, 400, 400);

  // Add text
  ctx.fillStyle = "white";
  ctx.font = "bold 48px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(character.name, 200, 200);

  // Save the image
  const buffer = canvas.toBuffer("image/jpeg");
  fs.writeFileSync(`./images/${character.name.toLowerCase()}.jpg`, buffer);
});
