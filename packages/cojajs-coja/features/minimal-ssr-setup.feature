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
      
      class MyBffFetcher implements BffFetcher {
        private cache = new Map();
      
        private static bffMap = {
          'example-bff-id': () => import('../bff').then(x => x.default),
        }
        
        async fetch(bffId) {
          if (!this.cache.has(bffId)) {
            const bff = MyBffFetcher.bffMap[bffId]?.();
            if (bff) {
              this.cache.set(bffId, bff);
            }
          }
      
          return this.cache.get(bffId) ?? null;
        }
      }
      
      export const runtime = new Runtime({ bffFetcher: new MyBffFetcher() });
      """
    And file "server-only/ssr-client.ts" reads as:
      """typescript
      import { Client, DirectClientRuntimeLink } from '@cojajs/coja';
      import { runtime } from './runtime';
      import type bff from '../bff'; 
      
      const link = new DirectClientRuntimeLink({ runtime, requestContext: null });
      
      export const ssrClient = Client.create<typeof bff>({
        clientRuntimeLink: link,
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
