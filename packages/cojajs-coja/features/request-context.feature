Feature: Request Context
  Your BFF functions may need to access information about the current request,
such as the user's identity or the request's origin.
Coja provides a `RequestContext` class to help you manage this information.

  Scenario: Request Context
    Given file "requestContext.ts" reads as:
      """typescript
      import { RequestContext } from '@cojajs/coja';
      
      type ContextType = {
        username: string;
      };
      
      export const requestContext = new RequestContext<ContextType>();
      """
    And file "bff.ts" reads as:
      """typescript
      import { Bff } from '@cojajs/coja';
      import { requestContext } from './requestContext';
      
      export default new Bff({
        rpc: {
          greet({ greeter }: { greeter: string }) {
            const { username } = requestContext.useValue();
            return `"hi", ${greeter} said to ${username}!`;
          },
        },
        requestContext,
      });
      """
    And file "server-only/runtime.ts" reads as:
      """typescript
      import { Runtime, type BffFetcher } from '@cojajs/coja';
      import bff from '../bff';
      
      const bffMap = {
        'example-bff-id': bff,
      };
      
      class OurBffFetcher implements BffFetcher {
        fetch(bffId) {
          return bffMap[bffId] ?? null;
        }
      }
      
      export const runtime = new Runtime({ bffFetcher: new OurBffFetcher() });
      """
    And file "server-only/ssr-client.ts" reads as:
      """typescript
      import { SsrClient } from '@cojajs/coja';
      import { runtime } from './runtime';
      import type bff from '../bff';
      
      export const ssrClient = SsrClient.create<typeof bff>({
        runtime,
        requestContext: { username: 'world' },
        bffId: 'example-bff-id'
      });
      """
    And file "server-only/ssr-index.ts" reads as:
      """typescript
      import { ssrClient } from './ssr-client';
      
      const SsrApp = async () => {
        const greeting = await ssrClient.rpc.greet({ greeter: 'the author' });
        return greeting;
      }
      
      async function main() {
        console.log(await SsrApp());
      }
      
      main();
      """
    When command "node ./server-only/ssr-index.ts" runs
    Then stdout from the last command should be:
      """
      "hi", the author said to world!
      """
