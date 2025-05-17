require('dotenv').config();
const express        = require('express');
const { ApolloServer } = require('apollo-server-express');
const typeDefs       = require('./schema');
const resolvers      = require('./resolvers');
const connectDB      = require('./db');
const authMiddleware = require('./middleware/auth');

(async () => {
  await connectDB();             
  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ auth: authMiddleware(req) })
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  app.listen(4000, () =>
    console.log(' GraphQL ready at http://localhost:4000/graphql')
  );
})();
