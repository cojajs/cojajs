Feature: Guest
A Bff can host other Bffs and provide them to clients, enabling reusable full-stack code.

  Scenario: Guest
    Given file "assume-external-called-si/bff.ts" reads as:
      """typescript
      import { Bff } from '@cojajs/coja';
      
      export default new Bff({
        rpc: {
          kilo(number) {
            return number * 1000;
          },
        },
      });
      """
    And file "assume-external-called-si/app.ts" reads as:
      """typescript
      import type { Client } from '@cojajs/coja';
      import type bff from './bff';
      
      type Props = {
        client: Client<typeof bff>;
      }
      
      export async function SiApp (props: Props) {
        return props.client.rpc.kilo(2);
      }
      """
    And file "bff.ts" reads as:
      """typescript
      import { Bff } from '@cojajs/coja';
      import si from './assume-external-called-si/bff';
      
      export default new Bff({
        rpc: {
          math: { twoPlusTwo: () => 4 },
        },
        guests: {
          si,
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
      import { SiApp } from '../assume-external-called-si/app';
      
      const SsrApp = async () => {
        const twoPlusTwo = await ssrClient.rpc.math.twoPlusTwo();
        const kilo = await SiApp({ client:  ssrClient.forGuest('si') });
        return twoPlusTwo + kilo;
      }
      
      async function main() {
        console.log(await SsrApp());
      }
      
      main();
      """
    When command "node ./server-only/ssr-index.ts" runs
    Then stdout from the last command should be:
      """
      2004
      """
