import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'schema.json',
  documents: 'lib/services/graphql/requests/**/*.ts',
  generates: {
    'lib/services/graphql/generated/index.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-urql'],
      config: {
        withHooks: true,
      },
    },
  },
};

export default config;
