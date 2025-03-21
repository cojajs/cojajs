Feature: Minimal SSR Setup

  Scenario: Minimal SSR Setup
    Given following code is our bff:
      """javascript
      const rpc = {
        math: { twoPlusTwo: () => 4 },
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
      global.client = new global.coja.SsrClient({
        runtime: global.runtime,
        requestContext: null,
        bffId: 'example-bff-id'
      });
      """
    And following code is our webApp:
      """javascript
      global.webApp = () => global.client.rpc.math.twoPlusTwo();
      """
    When the webApp is called
    Then the webApp should return 4
