'use strict';

const express = require('express');
const lowdb = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');
const { nanoid } = require('nanoid');

const constants = require('./constants');
const { validateButterfly, validateUser } = require('./validators');

async function createApp(dbPath) {
  const app = express();
  app.use(express.json());

  const db = await lowdb(new FileAsync(dbPath));
  await db.read();

  app.get('/', (req, res) => {
    res.json({ message: 'Server is running!' });
  });

  /* ----- BUTTERFLIES ----- */

  /**
   * Get an existing butterfly
   * GET
   */
  app.get('/butterflies/:id', async (req, res) => {
    const butterfly = await db.get('butterflies')
      .find({ id: req.params.id })
      .value();

    if (!butterfly) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json(butterfly);
  });

  /**
   * Create a new butterfly
   * POST
   */
  app.post('/butterflies', async (req, res) => {
    try {
      validateButterfly(req.body);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const newButterfly = {
      id: nanoid(),
      ...req.body
    };

    await db.get('butterflies')
      .push(newButterfly)
      .write();

    res.json(newButterfly);
  });


  /* ----- USERS ----- */

  /**
   * Get an existing user
   * GET
   */
  app.get('/users/:id', async (req, res) => {
    const user = await db.get('users')
      .find({ id: req.params.id })
      .value();

    if (!user) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json(user);
  });

  /**
 * Get a list of butterflies rated by a user
 * GET /users/:userId/rated-butterflies
 */
app.get('/users/:userId/rated-butterflies', async (req, res) => {
  const { userId } = req.params;

  // Retrieve all butterflies
  const butterflies = await db.get('butterflies').value();

  // Filter and map to get rated butterflies
  const ratedButterflies = butterflies
    .map(butterfly => {
      const userRating = butterfly.ratings?.find(r => r.userId === userId);
      return userRating ? { id: butterfly.id, name: butterfly.name, rating: userRating.rating } : null;
    })
    .filter(butterfly => butterfly !== null) // Remove null entries
    .sort((a, b) => b.rating - a.rating); // Sort by rating in descending order

  res.json(ratedButterflies);
});


  /**
   * Allow a user to rate butterflies on a scale of 0 through 5
   * POST /butterflies/:id/rate
   * Body: {"userId": string, "rating": number} - Rating must be between 0 - 5
   */
  app.post('/butterflies/:id/rate', async (req, res) => {
      const { id } = req.params;
      const {userId, rating } = req.body;

      // validate the rating
      if (rating !== 'number' || rating <0 || rating > 5){
        return res.status(400).json({'error': 'Rating must be between 0 and 5'});
      }

      // find the butterfly in the db
      const butterfly = await db.get('butterflies').find({ id }).value();

      if (!butterfly) {
        return res.status(404).json({ error: 'Butterfly not found' });
      }

      // initialize butterfly ratings if not present
      if (!butterfly.ratings) {
        butterfly.ratings = [];
      }
      
      // check if the user already rated the butterfly
      const existingRatingIndex = butterfly.ratings.findIndex(r => r.userId == userId);
      if (existingRatingIndex !== -1) {
        // updat ethe existing rating
        butterfly.ratings[existingRatingIndex] = rating;  
      } else {
        // insert the new rating tied to the user ID
        butterfly.ratings.push({ userId, rating});
      }

      // update the butterfly in the database
      await db.get('butterflies').find({id}).assign(butterfly).write();

      // Respond with the user's rating without exposing other ratings
      res.json({ message : 'rating added/updated successfully', rating: { userId, rating } });

  });

  /**
   * Create a new user
   * POST
   */
  app.post('/users', async (req, res) => {
    try {
      validateUser(req.body);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const newUser = {
      id: nanoid(),
      ...req.body
    };

    await db.get('users')
      .push(newUser)
      .write();

    res.json(newUser);
  });

  return app;
}

/* istanbul ignore if */
if (require.main === module) {
  (async () => {
    const app = await createApp(constants.DB_PATH);
    const port = process.env.PORT || 8000;

    app.listen(port, () => {
      console.log(`Butterfly API started at http://localhost:${port}`);
    });
  })();
}

module.exports = createApp;
