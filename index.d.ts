declare module 'oriql' {
  import { GraphQLScalarType } from 'graphql';

  type SchemaValue = GraphQLScalarType | GraphQLScalarType[] | SchemaObject | SchemaObject[];

  interface GraphQLArguments {
    [key: string]: SchemaValue;
    name?: string;
    defaultValue?: any;
    description?: string;
    deprecationReason?: string;
  }

  interface GraphQLOptions {
    args?: GraphQLArguments;
    name?: string;
    description?: string;
  }

  interface SchemaSource {}

  interface SchemaObject {
    type?: GraphQLPrimitiveType;
    required?: boolean;
    source?: SchemaSource;
    graphql?: GraphQLOptions;
    schema?: SchemaObject | SchemaObject[];
  }

  interface OriqlSchema {
    [key: string]: SchemaValue;
  }

  interface OriqlSchemaMutation {
    [key: string]: SchemaSource;
  }

  interface OriqlSchemaObject {
    name: string;
    instances: string[];
    desciption?: string;
    args?: GraphQLArguments;
    schema: OriqlSchema;
    mutation?: OriqlSchemaMutation;
  }

  export interface CompileConfig {
    client?: boolean;
    defaultResolver?: () => void;
    pattern?: string;
    schema?: OriqlSchemaObject[];
    server?: boolean;
    typescript?: boolean;
    flow?: boolean;
    external?: boolean;
  }

  export interface CompiledSchema {
    client: string;
    server: string | GraphQLSchema;
    typescript: string;
    flow: string;
  }
  export function compile(config: CompileConfig): CompiledSchema;
}
