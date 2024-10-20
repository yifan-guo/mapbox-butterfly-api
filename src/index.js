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
