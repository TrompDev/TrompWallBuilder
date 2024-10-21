const express = require('express');
const path = require('path');
const admin = require('./firebase-admin-config');
const app = express();
const port = process.env.PORT || 3000;

const db = admin.database();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/gameState', async (req, res) => {
    try {
      const snapshot = await db.ref('gameState').once('value');
      const gameState = snapshot.val();
      console.log("Fetched game state:", gameState);
      res.json(gameState || null);
    } catch (error) {
      console.error("Error fetching game state:", error);
      res.status(500).json({ error: 'Failed to fetch game state' });
    }
});

app.post('/api/updateGameState', async (req, res) => {
    try {
      console.log("Updating game state:", req.body);
      await db.ref('gameState').set(req.body);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating game state:", error);
      res.status(500).json({ error: 'Failed to update game state' });
    }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});