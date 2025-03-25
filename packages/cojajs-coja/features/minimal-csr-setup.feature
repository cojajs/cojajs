Feature: Minimal CSR Setup

  Scenario: Minimal CSR Setup
    Given file "bff/bff.ts" reads as:
      """typescript
      import { Bff } from '@cojajs/coja';
      
      export default new Bff({
        rpc: {
          math: { twoPlusTwo: () => 4 },
        },
      });
      """
    And file "bff/http-client.ts" reads as:
      """typescript
      import { Client, HttpClientRuntimeLink } from '@cojajs/coja';
      import type bff from './bff'; 
      
      const link = new HttpClientRuntimeLink({ endpointUrl: 'http://localhost:3000/coja' });
      
      export const httpClient = Client.create<typeof bff>({
        clientRuntimeLink: link,
        bffId: 'example-bff-id'
      });
      """
    And file "server-only/runtime.ts" reads as:
      """typescript
      import { Runtime, type BffFetcher } from '@cojajs/coja';
      
      class MyBffFetcher implements BffFetcher {
        private cache = new Map();
      
        private static bffMap = {
          'example-bff-id': () => import('../bff/bff.js').then(x => x.default),
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
    And file "web-server.ts" reads as:
      """
      import { Readable } from "stream";
      import express, {
        type Request,
        type Response as ExpressResponse,
      } from "express";
      import { CojaRequest } from "@cojajs/coja";
      import { runtime } from "./server-only/runtime";
      
      const app = express();
      const port = 3000;
      
      app.post(
        "/coja",
        express.json(),
        async (req: Request, expressRes: ExpressResponse) => {
          const body = req.body;
      
          const cojaRequest = new CojaRequest({
            bffId: body.bffId,
            guestPath: body.guestPath,
            rpcPath: body.rpcPath,
            args: body.args,
          });
      
          const cojaResponse = await runtime.execute(cojaRequest, {
            username: "janesmith",
          });
      
          expressRes.status(cojaResponse.status);
      
          cojaResponse.headers.forEach((value, key) => {
            expressRes.setHeader(key, value);
          });
      
          if (cojaResponse.body) {
            // biome-ignore lint/suspicious/noExplicitAny: <explanation>
            const nodeStream = Readable.fromWeb(cojaResponse.body as any);
            nodeStream.pipe(expressRes);
          } else {
            expressRes.end();
          }
        },
      );
      
      app.listen(port);
      """
    And file "app.ts" reads as:
      """typescript
      import { exit } from 'node:process';
      import { httpClient } from './bff/http-client';
      import "./web-server";
      
      const CsrApp = async () => {
        const twoPlusTwo = await httpClient.rpc.math.twoPlusTwo();
        return twoPlusTwo;
      }
      
      async function main() {
        console.log(await CsrApp());
        exit(0);
      }
      
      main();
      """
    # When command "cp -R . ~/minimal-csr-setup" runs
    When command "node ./app.ts" runs
    Then stdout from the last command should be:
      """
      4
      """
