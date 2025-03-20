Feature: Request Context

  Scenario: Request Context
    Given following code is our bff:
      """javascript
      global.bff = {
        greet: () => `hello, ${global.coja.getRequestContext().username}!`
      };
      """
    And following code is our bffRuntime:
      """javascript
      class OurBffGetter {
        getBff(bffId) {
          if (bffId !== 'example-bff-id') {
            return null;
          }
      
          return global.bff;
        }
      }
      
      global.bffRuntime = new global.coja.BffRuntime(new OurBffGetter());
      """
    And following code is our client:
      """javascript
      global.client = new global.coja.Client('example-bff-id');
      """
    And following code is our responder:
      """javascript
      const requestContext = { username: 'world' };
      global.responder = new global.coja.DirectResponder(global.bffRuntime, requestContext);
      global.responder.serve(global.client);
      """
    And following code is our webApp:
      """javascript
      global.webApp = () => global.client.rpc.greet();
      """
    When the webApp is called
    Then the webApp should return 'hello, world!'
