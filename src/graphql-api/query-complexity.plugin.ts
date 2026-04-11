import { Injectable } from '@nestjs/common';
import { Plugin } from '@nestjs/apollo';
import { GraphQLSchemaHost } from '@nestjs/graphql';
import type {
  ApolloServerPlugin,
  GraphQLRequestListener,
} from '@apollo/server';
import { DocumentNode, GraphQLError } from 'graphql';
import {
  fieldExtensionsEstimator,
  getComplexity,
  simpleEstimator,
} from 'graphql-query-complexity';
import { GraphQLRequest } from '@apollo/server';

const MAX_QUERY_COMPLEXITY = 120;

@Plugin()
@Injectable()
export class QueryComplexityPlugin implements ApolloServerPlugin {
  constructor(private readonly schemaHost: GraphQLSchemaHost) {}

  // eslint-disable-next-line @typescript-eslint/require-await
  async requestDidStart(): Promise<GraphQLRequestListener<any>> {
    return {
      // eslint-disable-next-line @typescript-eslint/require-await
      didResolveOperation: async ({
        request,
        document,
      }: {
        request: GraphQLRequest;
        document: DocumentNode;
      }) => {
        const complexity = getComplexity({
          schema: this.schemaHost.schema,
          query: document,
          variables: request.variables,
          operationName: request.operationName ?? undefined,
          estimators: [
            fieldExtensionsEstimator(),
            simpleEstimator({ defaultComplexity: 1 }),
          ],
        });

        if (complexity > MAX_QUERY_COMPLEXITY) {
          throw new GraphQLError(
            `Query is too complex: ${complexity}. Maximum allowed complexity: ${MAX_QUERY_COMPLEXITY}.`,
            {
              extensions: {
                code: 'QUERY_TOO_COMPLEX',
                http: { status: 400 },
              },
            },
          );
        }
      },
    };
  }
}
