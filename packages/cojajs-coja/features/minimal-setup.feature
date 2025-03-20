Feature: Minimal Setup

  Scenario: Minimal Setup
    Given following code is our bff:
      """javascript
      global.bff = {
        math: {
          twoPlusTwo: () => 4,
        },
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
      global.responder = new global.coja.DirectResponder(global.bffRuntime);
      global.responder.serve(global.client);
      """
    And following code is our webApp:
      """javascript
      global.webApp = () => global.client.rpc.math.twoPlusTwo();
      """
    When the webApp is called
    Then the webApp should return 4
