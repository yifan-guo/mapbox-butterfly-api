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


# Decisions
- Each rating is tied to a user
- To rate a butterfly, the userId is path parameter (therefore it is required) because a rating is tied to a user.
- The API will only keep each user's latest rating.
- Each butterfly has a ratings array so it can track ratings from multiple users.

# Why update a user's rating instead of creating new one?
If a user has many ratings, the retrieval operation may take longer. This can lead to increased latency in response times.

# Trade-offs
Rating Updates: Using an array for ratings facilitates quick retrieval and flexibility but requires additional checks to avoid duplicates. While this approach is simple, it may lead to inefficiencies with larger datasets.
Data Integrity: By implementing user uniqueness in ratings, we avoid duplicates but add complexity to the update logic.

# Endpoint Design 

## Why use PUT?
The PUT method is specifically designed to update an existing resource. In this case, since the user’s rating effectively represents an existing resource that needs to be updated if it already exists.

PUT requests are idempotent, meaning that making the same request multiple times will result in the same state. This is useful for updating a user's rating—if the user rates a butterfly again, the PUT request will simply update the existing rating rather than creating a duplicate.

`POST` is used when creating a new entire resource. If a user already has a rating, using POST for updating a rating can be misleading since `POST` is typically associated with creating a resource. This could cause confusion, especially if users expect a `POST` request to only create things rather than update them.
`PATCH` is used we want to update specific fields of a resource. Since we are only updating the ratings field , there is no need for `PATCH`. However, PATCH is useful if especially if we're considering future extensibility or clarity in our API design. Specifically, if we want to allow users to provide comments or feedback, `PATCH` would support that without needing to change the method.

# Handling Multiple ratings
Update existing rating - If the user has already rated the butterfly, the system should update their existing rating rather than create a new one. This prevents multiple entries for the same user and butterfly.
- If an existing rating is found, it updates that rating.
- If no existing rating is found, it creates a new entry.

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

# Explanation of the Tests
Success - Retrieve User Ratings:

This test checks that a valid user can retrieve their rating for a specific butterfly successfully.
Error - User Has Not Rated Any Butterflies:

This test verifies that if a user who has not rated the butterfly tries to access their rating, a 404 error is returned with an appropriate message.
Error - Butterfly Not Found:

This checks that if a non-existent butterfly ID is requested, a 404 error is returned.
Error - User Not Found:

This ensures that if a user ID does not exist, the endpoint returns a 404 error indicating that the user was not found.

# Database Design Changes
To support the new functionality for user ratings, the existing database design can be slightly modified to ensure efficient storage and retrieval of ratings while maintaining data integrity. Here are the key changes and considerations:
1. Ratings Structure:
- Each butterfly should have a `ratings` array that contains objects with `userId` and `rating`. This structure allows each butterfly to hold multiple ratings from different users.
- Ensure that the `ratings` array is initialized for each butterfly and that it handles updates properly.

## Example Structure
```
{
    "id": "butterfly-id",
    "commonName": "Example Butterfly",
    "species": "Example Species",
    "ratings": [
        { "userId": "user1-id", "rating": 4 },
        { "userId": "user2-id", "rating": 5 }
    ]
}
```
I've updated some entries in the butterflies.db.json to reflect the new design schema.

## User Ratings Uniqueness
To enforce that each user only rates a butterfly once, during rating update, the code checks for existing ratings and updates them instead of creating duplicates.

## Performance considerations
Depending on the size of the data and the number of ratings, I would consider the performance implications of filtering and sorting operations. In larger dataets, I would consider indexing the `userId` within the `ratings` array, although this would require a more complex database setup than the current flat JSON approach with lowdb. 

## Retrieval of Rated Butterflies
When retrieving a list of user's rated butterflies, we would need to traverse the `butterflies` collection and filter based on the `userId` in the ratings. This operation can be optimized for performance by considering database choices or structures - like indexing or creating a primary / secondary key - as the app scales.

# Testing
Thorough unit tests were created for both the new endpoints to ensure that they handle various scenarios, including valid and invalid input. Tests also check for existing ratings and ensure that updates occur correctly.

# Tidiness and Refactoring
The existing codebase was maintained with consistent naming conventions and structured comments to improve readability. Functions were modularized where necessary to promote reusability.

The addition of logging within the rating endpoints can enhance debugging without cluttering the codebase.