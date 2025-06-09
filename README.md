# Bricks Game

A TypeScript/JavaScript conversion of a classic brick-breaking game, originally written in C#.

🎮 [Play the game](https://orenhadar.github.io/bricks-js/)

## Features

- Classic brick-breaking gameplay
- Multiple ball support (up to 3 balls)
- Power-ups:
  - Three Balls: Activates all available balls
  - Super Size: Increases paddle width
  - Slow Motion: Slows down game speed
- Progressive level system
- Lives system with extra life bonuses
- Score tracking
- Angled paddle edges for trick shots

## Controls

- **Space**: Start game / Continue to next level
- **Left Arrow**: Move paddle left
- **Right Arrow**: Move paddle right

## Development

This game is built using:
- TypeScript
- Vite
- HTML5 Canvas

### Setup

```bash
# Clone the repository
git clone https://github.com/orenhadar/bricks-js.git

# Navigate to project directory
cd bricks-js

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## Credits

Original C# version created by Oren Hadar. TypeScript/JavaScript conversion also by Oren Hadar. 