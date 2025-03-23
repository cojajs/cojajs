Feature: Minimal SSR Setup

  Scenario: Minimal SSR Setup
    Given file "bff.ts" reads as:
      """typescript
      import { Bff } from '@cojajs/coja';
      
      export default new Bff({
        rpc: {
          math: { twoPlusTwo: () => 4 },
        },
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
        requestContext: null,
        bffId: 'example-bff-id'
      });
      """
    And file "server-only/ssr-index.ts" reads as:
      """typescript
      import { ssrClient } from './ssr-client';
      
      const SsrApp = async () => {
        const twoPlusTwo = await ssrClient.rpc.math.twoPlusTwo();
        return twoPlusTwo;
      }
      
      async function main() {
        console.log(await SsrApp());
      }
      
      main();
      """
    When command "node ./server-only/ssr-index.ts" runs
    Then stdout from the last command should be:
      """
      4
      """
