Feature: Guest
A Bff can host other Bffs and provide them to clients, enabling reusable full-stack code.

  Scenario: Guest
    Given we are using a full-stack third-party library:
      """javascript
      global.siBff = new global.coja.Bff({
        rpc: {
          kilo(number) {
            return number * 1000;
          },
        },
      });
      
      global.siWeb = async (client) => client.rpc.kilo(2);
      """
    Given following code is our bff:
      """javascript
      global.bff = new global.coja.Bff({
        rpc: {
          math: { twoPlusTwo: () => 4 },
        },
        guests: {
          si: siBff,
        },
      });
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
      global.webApp = async () => {
        const twoPlusTwo = await global.client.rpc.math.twoPlusTwo();
        const kilo = await global.siWeb(global.client.forGuest('si'));
        return twoPlusTwo + kilo;
      }
      """
    When the webApp is called
    Then the webApp should return 2004
