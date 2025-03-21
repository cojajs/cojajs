Feature: Request Context

  Scenario: Request Context
    Given following code is our bff:
      """javascript
      const rpc = {
        greet: () => `hello, ${global.coja.getRequestContext().username}!`
      };
      
      global.bff = new global.coja.Bff({ rpc });
      """
    And following code is our runtime:
      """javascript
      class OurBffGetter {
        getBff(bffId) {
          if (bffId !== 'example-bff-id') {
            return null;
          }
      
          return global.bff;
        }
      }
      
      global.runtime = new global.coja.Runtime(new OurBffGetter());
      """
    And following code is our client:
      """javascript
      const requestContext = { username: 'world' };
      global.client = new global.coja.SsrClient({
        runtime: global.runtime,
        requestContext: requestContext,
        bffId: 'example-bff-id'
      });
      """
    And following code is our webApp:
      """javascript
      global.webApp = () => global.client.rpc.greet();
      """
    When the webApp is called
    Then the webApp should return 'hello, world!'
