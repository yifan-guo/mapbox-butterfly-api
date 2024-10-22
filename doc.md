To allows users to rate butterflies on a scale between 0 and 5, I'll need to create a new endpoint. Below is an implementation that includes the Http method, endpoint, parameters, types, and the context for the new endpoint.

Method: PUT
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

Response Codes:
- 200 OK: If the rating is updated successfully.
- 201 Created: If a new rating is created.
- 400 Bad Request: If the request is invalid (e.g., invalid rating value).
- 404 Not Found: If the specified butterfly does not exist.


# Why update a user's rating instead of creating new one?
If a user has many ratings, the retrieval and sorting operations may take longer. This can lead to increased latency in response times. it is unlikely a user wants to retrieve their non-recent ratings.

# Why use PUT?
The PUT method is specifically designed to update an existing resource. In this case, since a user can only have one rating per butterfly, the user’s rating effectively represents an existing resource that needs to be updated if it already exists.

PUT requests are idempotent, meaning that making the same request multiple times will result in the same state. This is useful for updating a user's rating—if the user rates a butterfly again, the PUT request will simply update the existing rating rather than creating a duplicate.

`POST` is used when creating a new entire resource. If a user already has a rating, using POST for updating a rating can be misleading since `POST` is typically associated with creating a resource. This could cause confusion, especially if users expect a `POST` request to only create things rather than update them.
`PATCH` is used we want to update specific fields of a resource. Since the only fields that we can update is rating, there is no need for `PATCH`.

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

# Explanation of the Tests
Success - New Rating: Tests that a new rating can be added successfully.
Success - Update Existing Rating: Tests that an existing rating can be updated without creating a new entry.
Error - Invalid Rating Value: Ensures that ratings outside the range (0 to 5) return a validation error.
Error - User Not Found: Checks that if the user ID does not exist in the database, the endpoint returns an error.
Error - Butterfly Not Found: Tests that an attempt to rate a non-existing butterfly returns a not-found error.

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
