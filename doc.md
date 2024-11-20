To allows users to rate butterflies on a scale between 0 and 5, I'll need to create a new endpoint. Below is an implementation that includes the Http method, endpoint, parameters, types, and the context for the new endpoint.

Method: PATCH

Endpoint: `/butterflies/:id/rate`

Parameters:
```yaml
id:
  description: The ID of the butterfly to rate
  type: string
body: 
  description: An object containing the user's rating
  type: object
  properties:
    userId:
      description: Unique ID of the user
      type: string
      required: true
    rating:
      description: A rating between 0 and 5, inclusive
      type: integer
      required: true
  required:
    - userId
    - rating
```

Response Codes:
- 200 OK: If the rating is updated successfully.
- 201 Created: If a new rating is created.
- 400 Bad Request: If the request is invalid (e.g., invalid rating value).
- 404 Not Found: If the specified butterfly (or user) does not exist.


# Decisions
- Each rating is tied to a user
- Each butterfly has a ratings array so it can track ratings from multiple users.
- To rate a butterfly, the request must provide `userId` as a *path* parameter.
- The database will only keep each user's latest rating.

# Why update a user's rating instead of creating new one?
If a user has many ratings, the retrieval operation may take longer because more data has to cross the network and be deserialized. This can lead to increased latency in response times.

# Trade-offs
- **Rating Updates**: Using an array for ratings facilitates quick retrieval and flexibility but requires additional checks to avoid duplicates. While this approach is simple, it may lead to inefficiencies with larger datasets.
- **Data Integrity**: By implementing user uniqueness in ratings, we avoid duplicates but add complexity to the update logic.

# Endpoint Design 

## Why use PATCH to rate butterflies?
The PATCH method is specifically designed to allow for partial updates to an existing resource. This clarifies that we are only modifying the rating rather than replacing the entire butterfly object. 

PATCH is also useful for future extensibility or clarity in our API design. If we want to allow users to provide comments or feedback, `PATCH` would support that without needing to change the method.

- **POST** is used for creating a new resource. If a user already has a rating, using POST for updating can be misleading, as `POST` typically associates with creation. This could confuse users who expect `POST` requests to only create resources.
  
- **PUT** is used when updating an existing resource. Since we are only updating the ratings field, the rest of the object remains unchanged. `PUT` may mislead users into thinking they are updating other immutable aspects of the butterfly, such as its common name or species.

# Handling Multiple Ratings
- **Update Existing Rating**: If the user has already rated the butterfly, the system should update their existing rating rather than create a new one. This prevents multiple entries for the same user and butterfly:
  - If an existing rating is found, it updates that rating.
  - If no existing rating is found, it creates a new entry.

To tie each rating to a specific user, I include user information along with each rating. This way, each entry in the ratings array can contain both the rating and the user ID.

# Structure for Ratings
Instead of just storing ratings as an array of numbers, I decided to store them as an array of objects where each object contains the rating and the user ID. Here's an example:

```json
"ratings": [
  { "userId": "user123", "rating": 4 },
  { "userId": "user456", "rating": 5 }
]
```

# Benefits
- **User Privacy**: The endpoint respects user privacy by not exposing ratings from other users.
- **Clear Communication**: The response clearly communicates the result of the user's action without unnecessary data.

# Summary
This implementation ensures that when a user rates a butterfly, they only receive information relevant to their action, maintaining the integrity of user privacy.

# Explanation of the Tests
- **Success - New Rating**: Tests that a new rating can be added successfully.
- **Success - Update Existing Rating**: Tests that an existing rating can be updated without creating a new entry.
- **Error - Invalid Rating Value**: Ensures that ratings outside the range (0 to 5) return a validation error.
- **Error - User Not Found**: Checks that if the user ID does not exist in the database, the endpoint returns an error.
- **Error - Butterfly Not Found**: Tests that an attempt to rate a non-existing butterfly returns a not-found error.

# Method: GET
- **Endpoint**: `/users/:userId/rated-butterflies`
- **Parameters**:
  - **userId** (path parameter): The ID of the user who gives the rating
    - **type**: string
    - **required**: true

User-specific ratings: The mapping process retrieves and includes the rating for the specific user identified by `userId`.

# Example Response
If a user rated two butterflies, the response might look like this:

```json
[
  { "id": "butterfly1", "name": "Monarch Butterfly", "rating": 5 },
  { "id": "butterfly2", "name": "Swallowtail Butterfly", "rating": 4 }
]
```

# Explanation of the Tests

- **Success - Retrieve User Ratings**: 
  This test checks that a valid user can successfully retrieve their rating for a specific butterfly.

- **Error - User Has Not Rated Any Butterflies**: 
  This test verifies that if a user who has not rated a butterfly tries to access their rating, a 404 error is returned with an appropriate message.

- **Error - Butterfly Not Found**: 
  This test checks that if a non-existent butterfly ID is requested, a 404 error is returned.

- **Error - User Not Found**: 
  This ensures that if a user ID does not exist, the endpoint returns a 404 error indicating that the user was not found.

# Database Design Changes

To support the new functionality for user ratings, the existing database design can be slightly modified to ensure efficient storage and retrieval of ratings while maintaining data integrity. Key changes and considerations include:

1. **Ratings Structure**:
   - Each butterfly should have a `ratings` array containing objects with `userId` and `rating`. This structure allows each butterfly to hold multiple ratings from different users.
   - Ensure that the `ratings` array is initialized for each butterfly and properly handles updates.

## Example Structure
```json
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

To ensure that each user can only rate a butterfly once, the code checks for existing ratings during the update process and modifies them instead of creating duplicates.

## Performance Considerations

Depending on the size of the data and the number of ratings, it's important to consider the performance implications of filtering and sorting operations. For larger datasets, indexing the `userId` within the `ratings` array may be beneficial, though this would require a more complex database setup than the current flat JSON approach with lowdb.

## Retrieval of Rated Butterflies

When retrieving a list of a user's rated butterflies, the system needs to traverse the `butterflies` collection and filter based on the `userId` in the ratings. This operation can be optimized for performance by considering database structures, such as indexing or creating primary/secondary keys, as the application scales.

# Testing

Thorough unit tests were created for both new endpoints to ensure they handle various scenarios, including valid and invalid input. Tests also check for existing ratings and confirm that updates occur correctly.

Additionally, curl commands to generate a user rating and get a user's sorted ratings have been added to the README to enhance testing without cluttering the codebase.

# Tidiness and Refactoring

The existing codebase has been maintained with consistent naming conventions and structured comments to improve readability. Functions were modularized where necessary to promote reusability.