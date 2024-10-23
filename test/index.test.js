'use strict';

const path = require('path');
const lowdb = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');
const request = require('supertest');
const { nanoid } = require('nanoid');

jest.mock('nanoid');

const createApp = require('../src/index');

let app;

beforeAll(async () => {
  // Create a test database
  const testDbPath = path.join(__dirname, 'test.db.json');
  const db = await lowdb(new FileAsync(testDbPath));

  // Fill the test database with data
  await db.setState({
    butterflies: [
      {
        id: 'wxyz9876',
        commonName: 'test-butterfly',
        species: 'Testium butterflius',
        article: 'https://example.com/testium_butterflius'
      }
    ],
    users: [
      {
        id: 'abcd1234',
        username: 'test-user'
      }
    ]
  }).write();

  // Create an app instance
  app = await createApp(testDbPath);
});

describe('GET root', () => {
  it('success', async () => {
    const response = await request(app)
      .get('/');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'Server is running!'
    });
  });
});

describe('GET butterfly', () => {
  it('success', async () => {
    const response = await request(app)
      .get('/butterflies/wxyz9876');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 'wxyz9876',
      commonName: 'test-butterfly',
      species: 'Testium butterflius',
      article: 'https://example.com/testium_butterflius'
    });
  });

  it('error - not found', async () => {
    const response = await request(app)
      .get('/butterflies/bad-id');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: 'Not found'
    });
  });
});

describe('POST butterfly', () => {
  it('success', async () => {
    nanoid.mockReturnValue('new-butterfly-id');

    const postResponse = await request(app)
      .post('/butterflies')
      .send({
        commonName: 'Boop',
        species: 'Boopi beepi',
        article: 'https://example.com/boopi_beepi'
      });

    expect(postResponse.status).toBe(200);
    expect(postResponse.body).toEqual({
      id: 'new-butterfly-id',
      commonName: 'Boop',
      species: 'Boopi beepi',
      article: 'https://example.com/boopi_beepi'
    });

    const getResponse = await request(app)
      .get('/butterflies/new-butterfly-id');

    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toEqual({
      id: 'new-butterfly-id',
      commonName: 'Boop',
      species: 'Boopi beepi',
      article: 'https://example.com/boopi_beepi'
    });
  });

  it('error - empty body', async () => {
    const response = await request(app)
      .post('/butterflies')
      .send();

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid request body'
    });
  });

  it('error - missing all attributes', async () => {
    const response = await request(app)
      .post('/butterflies')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid request body'
    });
  });

  it('error - missing some attributes', async () => {
    const response = await request(app)
      .post('/butterflies')
      .send({ commonName: 'boop' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid request body'
    });
  });
});

describe('GET user', () => {
  it('success', async () => {
    const response = await request(app)
      .get('/users/abcd1234');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 'abcd1234',
      username: 'test-user'
    });
  });

  it('error - not found', async () => {
    const response = await request(app)
      .get('/users/bad-id');
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: 'Not found'
    });
  });
});

describe('GET user ratings for butterflies', () => {
  beforeEach(async () => {
    // Reset the database to a known state before each test
    await db.setState({
      butterflies: [
        {
          id: 'wxyz9876',
          commonName: 'test-butterfly',
          species: 'Testium butterflius',
          article: 'https://example.com/testium_butterflius',
          ratings: [
            { userId: 'abcd1234', rating: 4 },
            { userId: 'user2', rating: 5 }
          ]
        }
      ],
      users: [
        {
          id: 'abcd1234',
          username: 'test-user'
        },
        {
          id: 'user2',
          username: 'another-user'
        }
      ]
    }).write();
  });

  it('success - retrieve user ratings', async () => {
    const response = await request(app)
      .get('/butterflies/wxyz9876/rate?userId=abcd1234');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      userId: 'abcd1234',
      ratings: [
        { butterflyId: 'wxyz9876', rating: 4 }
      ]
    });
  });

  it('error - user has not rated any butterflies', async () => {
    const response = await request(app)
      .get('/butterflies/wxyz9876/rate?userId=user2'); // User2 has not rated this butterfly

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: 'No ratings found for this user'
    });
  });

  it('error - butterfly not found', async () => {
    const response = await request(app)
      .get('/butterflies/bad-id/rate?userId=abcd1234');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: 'Butterfly not found'
    });
  });

  it('error - user not found', async () => {
    const response = await request(app)
      .get('/butterflies/wxyz9876/rate?userId=nonexistent-user');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: 'User not found'
    });
  });
});


describe('PUT butterfly rating', () => {
  it('success - new rating', async () => {
    const response = await request(app)
      .put('/butterflies/wxyz9876/rate')
      .send({
        userId: 'abcd1234', // Existing user
        rating: 5
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'Rating added/updated successfully',
      rating: {
        userId: 'abcd1234',
        rating: 5
      }
    });

    // Verify the updated rating
    const updatedButterfly = await request(app).get('/butterflies/wxyz9876');
    expect(updatedButterfly.body.ratings).toEqual([
      { userId: 'abcd1234', rating: 5 }
    ]);
  });

  it('success - update existing rating', async () => {
    // First, create an initial rating
    await request(app)
      .put('/butterflies/wxyz9876/rate')
      .send({
        userId: 'abcd1234',
        rating: 3
      });

    // Now update the rating
    const response = await request(app)
      .put('/butterflies/wxyz9876/rate')
      .send({
        userId: 'abcd1234',
        rating: 4
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'Rating added/updated successfully',
      rating: {
        userId: 'abcd1234',
        rating: 4
      }
    });

    // Verify the updated rating
    const updatedButterfly = await request(app).get('/butterflies/wxyz9876');
    expect(updatedButterfly.body.ratings).toEqual([
      { userId: 'abcd1234', rating: 4 }
    ]);
  });

  it('error - invalid rating value', async () => {
    const response = await request(app)
      .put('/butterflies/wxyz9876/rate')
      .send({
        userId: 'abcd1234',
        rating: 6 // Invalid rating (above 5)
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Rating must be a number between 0 and 5'
    });
  });

  it('error - user not found', async () => {
    const response = await request(app)
      .put('/butterflies/wxyz9876/rate')
      .send({
        userId: 'nonexistent-user', // Non-existing user
        rating: 4
      });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: 'Butterfly not found'
    });
  });

  it('error - butterfly not found', async () => {
    const response = await request(app)
      .put('/butterflies/bad-id/rate')
      .send({
        userId: 'abcd1234',
        rating: 5
      });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: 'Butterfly not found'
    });
  });
});


describe('POST user', () => {
  it('success', async () => {
    nanoid.mockReturnValue('new-user-id');

    const postResponse = await request(app)
      .post('/users')
      .send({
        username: 'Buster'
      });

    expect(postResponse.status).toBe(200);
    expect(postResponse.body).toEqual({
      id: 'new-user-id',
      username: 'Buster'
    });

    const getResponse = await request(app)
      .get('/users/new-user-id');

    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toEqual({
      id: 'new-user-id',
      username: 'Buster'
    });
  });

  it('error - empty body', async () => {
    const response = await request(app)
      .post('/users')
      .send();

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid request body'
    });
  });

  it('error - missing all attributes', async () => {
    const response = await request(app)
      .post('/users')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Invalid request body'
    });
  });
});
