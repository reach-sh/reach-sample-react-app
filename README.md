# reach-sample-react-app

This is a sample React app that uses Reach to generate, deploy, and interact with a smart contract on Ethereum.

Prerequisites:

* Install and run the [Ganache](https://www.trufflesuite.com/ganache) app on localhost:8545
  - configure it so the first user has a lot of ETH
* Install the [MetaMask extension](https://metamask.io/) on both [Chrome](https://www.google.com/chrome/) and [Firefox](https://www.mozilla.org/en-US/firefox/).
* Install [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) and use it to install & use node 12.18.3 or higher

To see the demo in action:

```bash
npm install   # this may take 5-15 mins to install
npm run start # this may take a minute to compile
```

Open http://localhost:3000 in both Firefox and Chrome;
run the app as Alice on one, and Bob on the other.

If you modify `src/index.rsh`, you must run the `compile-rsh` script so that React will pick up the changes:

```bash
npm run compile-rsh
```
