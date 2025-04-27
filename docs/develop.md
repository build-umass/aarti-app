# A Basic Guide to Contributing

[Types](#Types) &nbsp; &nbsp; [Routes](#Routes) &nbsp; &nbsp; [Database](#Database)  &nbsp; &nbsp; [Frontend](#Frontend)


# Types
This project uses a shared types definiton file in `/types`

For example, the `QuizItem` interface

```ts
export interface QuizItem {
    id: number;
    ...
    feedback: string;
}
```

This is highly beneficial in that you can ensure safety across the frontend and backend. For example, if you updated the `QuizItem` to include a new field, it is now necessary everywhere `QuizItem` is used works with the new definition. Otherwise, typescript will throw an error.

# Routes

Our backend is a node.js express server

Here is the [express.js documentation](https://expressjs.com/), but chatbots are also a great resource for learning express due to the vast amounts of example code available online

If you were born in a padded cell, you might write all your express like this:
```ts
router.get('/', (req, res) => {
    try {
        const { x, y } = req.body 

        if (!database.enter(x)) {
            return res.status(500).json({error: "error"})
        } else {
             return res.status(201).json({message: "success"});
        }

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
})
```

Hopefully you weren't. 

Rather than putting all your logic for each endpoint in a single function, with all your endpoints in the same file, we can make it ✨modular✨

Here's how we do that:

- index.ts: main entrypoint, listens on port
- app.ts: instructions for setting up the server
- routes.ts: where you can see all your endpoints ('/resources/update', etc.) with their methods
- controllers.ts: handles requests and responses, calls the right services
- services.ts: the core logic, handles stuff like databases

Your end result will be a lot cleaner and easier to fix. Refer to the current apps/backend to see a nice example of how you could create a route with a controller and a service.

# Database

We are using mongodb. You can see examples of inserting, searching, deleting and updating database documents in `apps/backend/services.ts`

# Frontend

Our current project is a React Native Expo app.

To get started, check out run-locally.md

Our app will consist of these main components:

- resources: text-based resources available in multiple languages provided to us by Aarti home
- quiz: an interactive learning experience in quiz format to enable learners to inform themselves in an engaging way
- chatbot: a place you can ask relevant questions and get returned links to the proper resources

Additionally, the admin client (used to put resources and quiz questions in the database for users to view) is a next js project