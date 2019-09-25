### This is not ready for production use yet

Oriql - Simple and Effective GraphQL Schema Management

Oriql is a GraphQL schema compiler. It allows you to write your schema from a single source of truth (as a Javascript object) and have both the server schema and client queries automatically generated.

# Basic Example

```js
// Schema File (ie. /schema/index.js)
import { string } from 'oriql/types';

export const schema = {
  name: 'HelloComponent', // Unique name given to the schema name
  instances: ['Hello'], // Optional: alias names to give to this schema.  All must be unique
  schema: {
    compiler: string,
    framework: string,
  },
};

// On the server (ie. server.js)
const { ApolloServer } = require('apollo-server');
const { compile: compileSchema } = require('oriql'); // Could also use a static file built at build time

const { schema } = require('./schema');

(async () => {
  const { server: serverSchema } = await compileSchema({ schema });

  const server = new ApolloServer({ schema: serverSchema });

  server.listen().then(() => console.log('server is running on localhost:4000'));
})();

// On the client
import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from '@apollo/react-hooks';
import { Hello } from './queries'; // static file built by Oriql

export default () => (
  const { loading, error, data } = useQuery(gql(Hello));

  if (loading) {
    return 'Loading...';
  }

  if (error) {
    return `Error ${error.message}`;
  }

  return (
    <div>{data.compiler} is being used in conjunction with {data.framework}!</div>
  )
);
```

## Current Features

- Compile server schema
- Compile client queries
- Compile client mutations
- Typescript types generated from schema
- Flow types generated from schema

## Upcoming Features

- Server framework compatible with (at the very least) Apollo
  - Static schema compilation
  - Input resolvers for each field in schema
- Client framework compatible with (at the very least) React and Apollo
  - Automatic query/mutation execution
  - Data reconciling based on query
- Schema generation from protobuf

## Examples

Further examples can be found in our [examples repository](https://github.com/michaelcacciatore/oriql-examples).
