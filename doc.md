To allows users to rate butterflies on a scale between 0 and 5, I'll need to create a new endpoint. Below is an implementation that includes the Http method, endpoint, parameters, types, and the context for the new endpoint.

Method: POST
Endpoint: `/butterflies/:id/rate`
Parameters:
- id (path parameter): The ID of the butterfly to rate
    type: string
- body (request body): An object containing the user's rating
    - userId: unique ID of the user
        type: string
        required: true
    - rating: A rating between 0 and 5, inclusive
        type: integer
        required: true

# Why use POST?
- *Create or Update* `POST` is used when creating a new resource or updating an existing one. In the context of ratings, we want to create a rating or update an existing one for a butterfly.
- *Non-idempotent Operation* - `POST` is non-idempotent, meaning that calling the same endpoint multiple times with the same data can have different effects. This aligns with the idea of creating or updating ratings.

## Handling Multiple ratings
Update existing rating - If the user has already rated the butterfly, the system should update their existing rating rather than create a new one. This prevents multiple entries for the same user and butterfly.
- If an existing rating is found, it updates that rating.
- If no existing rating is found, it creates a new entry.

# Decisions
Id as path parameters because they are required
Each rating is tied to a user
Each butterfly has a ratings array so it can track ratings from multiple users.
Only the user's ratings is included in the POST response

To tie each rating to a specific user, I include the user information along with each rating. This way, each entry in the ratings array can contain both the rating and the user ID. 

# Structure for Ratings
Instead of just storing ratings as an array of numbers, I decided to store them as an array of objects where each object contains the rating and the user ID. Here's an example:
```
"ratings": [
  { "userId": "user123", "rating": 4 },
  { "userId": "user456", "rating": 5 }
]
```

# Benefits
User privacy: The endpoint respects user privacy by not exposing the ratings from other users.
Clear Communication: the response clearly communicates the result of the user's action without unnecessary data.

# Summary
This implementa ensures that when a user rates a butterfly, they only receive information relevant to their action, maintaining the integrity of user privacy. 


METODD: GET
Endpoint: `/users/:userId/rated-butterflies`
Parameters:
- userId (path parameter): The ID of the user who gives the rating
    type: string
    required: true
    
User-specific ratings: The mapping process retrieves and includes the rating for the specific user identified by `userId`.

# Example Response
If a user rated two butterflies, the response might look like this:
```
[
  { "id": "butterfly1", "name": "Monarch Butterfly", "rating": 5 },
  { "id": "butterfly2", "name": "Swallowtail Butterfly", "rating": 4 }
]
```


# Decisions
UserId is a path parameter because it is required.
When a user requests their rated buterflies, omitting other users' ratings

# Benefits
Privacy: Only the requesting user's rating is visible, which respects user privacy and data security
