Feature: Guest
A Bff can host other Bffs and provide them to clients, enabling reusable full-stack code.

  Scenario: Guest
    Given file "assume-external-called-si/bff.ts" reads as:
      """typescript
      import { Bff } from '@cojajs/coja';
      
      export const bff = new Bff({
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
      import type { bff } from './bff';
      
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
      import { bff as si } from './assume-external-called-si/bff';
      
      export const bff = new Bff({
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
      import { bff } from '../bff';
      
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
      import { Client, DirectClientRuntimeLink } from '@cojajs/coja';
      import { runtime } from './runtime';
      import type { bff } from '../bff'; 
      
      const link = new DirectClientRuntimeLink({ runtime, requestContext: null });
      
      export const ssrClient = Client.create<typeof bff>({
        clientRuntimeLink: link,
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

  Scenario: Non-existent Guest Path
    Given file "assume-external-called-si/bff.ts" reads as:
      """typescript
      import { Bff } from '@cojajs/coja';
      
      export const bff = new Bff({
        rpc: {
          kilo(number) {
            return number * 1000;
          },
        },
      });
      """
    And file "bff.ts" reads as:
      """typescript
      import { Bff } from '@cojajs/coja';
      import { bff as si } from './assume-external-called-si/bff';
      
      export const bff = new Bff({
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
      import { bff } from '../bff';
      
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
      import { Client, DirectClientRuntimeLink } from '@cojajs/coja';
      import { runtime } from './runtime';
      import type { bff } from '../bff'; 
      
      const link = new DirectClientRuntimeLink({ runtime, requestContext: null });
      
      export const ssrClient = Client.create<typeof bff>({
        clientRuntimeLink: link,
        bffId: 'example-bff-id'
      });
      """
    And file "server-only/non-existent-guest.ts" reads as:
      """typescript
      import { ssrClient } from './ssr-client';
      
      const AccessNonExistentGuest = async () => {
        try {
          // Attempting to access a non-existent guest 'nonexistent'
          const client = ssrClient.forGuest('nonexistent');
          await client.rpc.someMethod();
          return "This should not execute";
        } catch (error) {
          return `Error: ${error.message}`;
        }
      }
      
      async function main() {
        console.log(await AccessNonExistentGuest());
      }
      
      main();
      """
    When command "node ./server-only/non-existent-guest.ts" runs
    Then stdout from the last command should be:
      """
      Error: [bad-request] Expected object at path "nonexistent", but got undefined.
      """

  Scenario: Two-Level Deep Guest Path Failure
    Given file "level1-bff/bff.ts" reads as:
      """typescript
      import { Bff } from '@cojajs/coja';
      
      export const bff = new Bff({
        rpc: {
          level1Function() {
            return 'level1';
          },
        },
        guests: {
          // No 'level2' guest defined here
        },
      });
      """
    And file "bff.ts" reads as:
      """typescript
      import { Bff } from '@cojajs/coja';
      import { bff as level1 } from './level1-bff/bff';
      
      export const bff = new Bff({
        rpc: {
          rootFunction: () => 'root',
        },
        guests: {
          level1,
        },
      });
      """
    And file "server-only/runtime.ts" reads as:
      """typescript
      import { Runtime, type BffFetcher } from '@cojajs/coja';
      import { bff } from '../bff';
      
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
      import { Client, DirectClientRuntimeLink } from '@cojajs/coja';
      import { runtime } from './runtime';
      import type { bff } from '../bff'; 
      
      const link = new DirectClientRuntimeLink({ runtime, requestContext: null });
      
      export const ssrClient = Client.create<typeof bff>({
        clientRuntimeLink: link,
        bffId: 'example-bff-id'
      });
      """
    And file "server-only/nested-guest-access.ts" reads as:
      """typescript
      import { ssrClient } from './ssr-client';
      
      const AccessNestedGuest = async () => {
        try {
          // First level works - 'level1' guest exists
          const level1Client = ssrClient.forGuest('level1');
          
          // Successfully accessing a function at level1
          const level1Result = await level1Client.rpc.level1Function();
          
          // Second level fails - 'level2' guest doesn't exist in level1
          const level2Client = level1Client.forGuest('level2');
          await level2Client.rpc.someMethod();
          
          return "This should not execute";
        } catch (error) {
          return `Error: ${error.message}`;
        }
      }
      
      async function main() {
        console.log(await AccessNestedGuest());
      }
      
      main();
      """
    When command "node ./server-only/nested-guest-access.ts" runs
    Then stdout from the last command should be:
      """
      Error: [bad-request] Expected object at path "level1.level2", but got undefined.
      """
