import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as backend from './build/index.main.mjs';
import * as reach from '@reach-sh/stdlib/ETH';

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function renderDOM() {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root')
  );
}

class App extends React.Component {
  constructor(props) {
    super(props);
    // Modes:
    // * ConnectAccount: connectAccount
    // * FundAccount: fundAccount or skipFundAccount
    // * SelectRole: selectRole
    // * RunRole: defined in Alice & Bob sub-components
    this.state = {
      mode: 'ConnectAccount',
      // Set by ConnectAccount
      acc: undefined,
      addr: undefined,
      bal: undefined,
      // Set by FundAccount
      fundAmountStandard: undefined,
      // Set by SelectRole
      role: undefined,
    }
  }

  componentDidMount() {
    if (this.state.mode === 'ConnectAccount') {
      this.connectAccount();
    }
  }

  async connectAccount() {
    const acc = await reach.getDefaultAccount();
    const addr = await acc.networkAccount.getAddress();
    const balAtomic = await reach.balanceOf(acc);
    const bal = reach.formatCurrency(balAtomic, 4);
    try {
      const faucet = await reach.getFaucet();
      this.setState({mode: 'FundAccount', acc, addr, bal, faucet});
    } catch (e) {
      // Couldn't find a faucet; skip to SelectRole
      this.setState({mode: 'SelectRole', acc, addr, bal});
    }
  }

  async fundAmountChanged(fundAmountStandard) {
    this.setState({fundAmountStandard});
  }

  async fundAccount() {
    const {faucet, acc, fundAmountStandard = '10'} = this.state;
    const amountAtomic = reach.parseCurrency(fundAmountStandard);
    reach.transfer(faucet, acc, amountAtomic);
    this.setState({mode: 'SelectRole'});
  }

  async skipFundAccount() {
    this.setState({mode: 'SelectRole'});
  }

  async selectRole(role) {
    this.setState({mode: 'RunRole', role});
  }

  render() {
    let app = null;
    switch (this.state.mode) {
      case 'ConnectAccount':
        app = (
          <div>
            Please wait while we connect to your account.
            If this takes more than a few seconds, there may be something wrong.
          </div>
        );
        break;
      case 'FundAccount':
        app = (
          <div>
            <h1>Fund account</h1>
            <br />
            Address: {this.state.addr}
            <br />
            Balance: {this.state.bal} {reach.standardUnit}
            <hr />
            Would you like to fund your account with additional {reach.standardUnit}?
            <br />
            (This only works on certain devnets)
            <br />
            <input
              type='number'
              onChange={(e) => {
                this.fundAmountChanged(e.currentTarget.value);
              }}
            />
            <button onClick={() => this.fundAccount()}>Fund Account</button>
            <button onClick={() => this.skipFundAccount()}>Skip</button>
          </div>
        );
        break;
      case 'SelectRole':
        app = (
          <div>
            Please select a role:
            <br />
            <button
              onClick={() => this.selectRole(<Alice acc={this.state.acc} />)}
            >Alice</button>
            <button
              onClick={() => this.selectRole(<Bob acc={this.state.acc} />)}
            >Bob</button>
            <p>
              <strong>Alice</strong>:
              <br /> Requests payment from Bob in order to reveal a secret.
            </p>
            <p>
              <strong>Bob</strong>:
              <br /> Pays Alice in order for her to reveal a secret.
            </p>
          </div>
        );
        break;
      case 'RunRole':
        app = this.state.role;
        break;
      default:
        app = (
          <div>
            Sorry, something went wrong.
            Please refresh the page.
          </div>
        );
        break;
    }

    return (
      <div className="App">
        <header className="App-header">
          {app}
        </header>
      </div>
    );
  }
}


const defaultInfo = 'the cake is a lie';
const defaultRequestStandard = '0.5';

class Alice extends React.Component {
  constructor(props) {
    super(props);
    // Modes:
    // * Deploy: deploy
    // * EnterInfo: enterInfo
    // * EnterRequest: enterRequest
    // * RunBackend: runBackend
    // * BackendRunning: backendRan
    // * BackendRan
    this.state = {
      mode: 'Deploy',
      acc: props.acc,
      // Set by Deploy
      ctc: undefined,
      // Set (async) by Deploy
      ctcInfoStr: undefined,
      // Set by EnterSecret
      secret: undefined,
      // Set by EnterAmount
      requestStandard: undefined,
    };
  }

  async deploy() {
    const {acc} = this.state;
    const ctc = acc.deploy(backend);
    this.setState({mode: 'EnterInfo', ctc});

    // (async portion: may be delayed)
    const ctcInfoStr = JSON.stringify(await ctc.getInfo(), null, 2);
    this.setState({ctcInfoStr});
  }

  infoChanged(info) {
    this.setState({info});
  }

  enterInfo() {
    let {info} = this.state;
    info = info || defaultInfo;
    this.setState({mode: 'EnterRequest', info});
  }

  requestChanged(requestStandard) {
    this.setState({requestStandard});
  }

  enterRequest() {
    let {requestStandard} = this.state;
    requestStandard = requestStandard || defaultRequestStandard;
    this.setState({mode: 'RunBackend', requestStandard});
  }

  async runBackend() {
    const {ctc, requestStandard, info} = this.state;
    this.setState({mode: 'BackendRunning'});

    // (async portion: may be delayed)
    const request = reach.parseCurrency(requestStandard);
    const interact = {request, info};
    await backend.Alice(reach, ctc, interact);
    this.setState({mode: 'BackendRan'});
  }

  async copyToClipborad(button) {
    navigator.clipboard.writeText(this.state.ctcInfoStr);
    const origInnerHTML = button.innerHTML;
    button.innerHTML = 'Copied!';
    button.disabled = true;
    await sleep(1000);
    button.innerHTML = origInnerHTML;
    button.disabled = false;
  }

  render() {
    let alice = null;
    switch (this.state.mode) {
      case 'Deploy':
        alice = (
          <div>
            As Alice, it is your job to deploy the contract.
            <br />
            <button
              onClick={() => this.deploy()}
            >Deploy</button>
          </div>
        );
        break;
      case 'EnterInfo':
        alice = (
          <div>
            Alice, what is your secret info?
            <br />
            <textarea
              onChange={(e) => this.infoChanged(e.currentTarget.value)}
              placeholder={defaultInfo}
            />
            <br />
            <button onClick={() => this.enterInfo()}
            >Submit secret info</button>
          </div>
        )
        break;
      case 'EnterRequest':
        alice = (
          <div>
            Alice, how much {reach.standardUnit} should Bob pay you
            to reveal this info?
            <br />
            <input
              type='number'
              onChange={(e) => this.requestChanged(e.currentTarget.value)}
              placeholder={defaultRequestStandard}
            />
            <br />
            <button onClick={() => this.enterRequest()}
            >Submit request</button>
          </div>
        );
        break;
      case 'RunBackend':
        alice = (
          <div>
            <p>
              You request <strong>{this.state.requestStandard}</strong> {reach.standardUnit + ' '}
              to reveal secret info: <strong>{this.state.info}</strong>
            </p>
            <p>
              Ready to connect to the contract?
            </p>
            <p>
              You will be prompted to pay for two transactions.
              The first transaction will publish your requested amount,
              and the second will publish your secret while simultaneously
              retrieving the requested amount from the contract.
            </p>
            <button
              onClick={() => this.runBackend()}
            >Connect</button>
          </div>
        );
        break;
      case 'BackendRunning':
        if (this.state.ctcInfoStr === undefined) {
          alice = (
            <div>
              Waiting for the contract to deploy...
              If this takes more than 1 min, something may be wrong.
            </div>
          )
        } else {
          alice = (
            <div>
              <h2>Contract Info</h2>
              The contract is running!
              Please give Bob the following contract info.

              <pre>
                {this.state.ctcInfoStr}
              </pre>
              <br />
              <button
                onClick={async (e) => this.copyToClipborad(e.currentTarget)}
              >Copy to clipboard</button>
              <br />

              You will be automatically prompted to approve the next transaction
              once Bob has paid the requested amount into the contract.
            </div>
          );
        }
        break;
      case 'BackendRan':
        alice = (
          <div>
            Thank you, Alice.
            The contract has run to completion.
          </div>
        )
        break;
      default:
        alice = (
          <div>
            Sorry, Alice, something went wrong.
            Please refresh the page.
          </div>
        );
    }
    return (
      <div className="Alice">
        {alice}
      </div>
    );
  }
}

class Bob extends React.Component {
  constructor(props) {
    super(props);
    // Modes
    // * RunBackend: runBackend
    // * ApproveRequest
    // * DisplayInfo
    this.state = {
      mode: 'RunBackend',
      acc: props.acc,
      // Set by RunBackend
      ctcInfoStr: undefined,
      // Set (async) by RunBackend
      requestStandard: undefined,
      info: undefined,
    };
  }

  ctcInfoStrChanged(ctcInfoStr) {
    this.setState({ctcInfoStr});
  }

  async runBackend() {
    const {acc, ctcInfoStr} = this.state;
    const ctcInfo = JSON.parse(ctcInfoStr);
    const ctc = acc.attach(backend, ctcInfo);
    this.setState({mode: 'ApproveRequest'});

    // These callbacks will be invoked asynchronously
    const interact = {
      want: (request) => {
        const requestStandard = reach.formatCurrency(request, 4);
        this.setState({mode: 'DisplayInfo', requestStandard});
      },
      got: (infoBytes) => {
        const info = reach.hexToString(infoBytes);
        this.setState({info});
      },
    };
    await backend.Bob(reach, ctc, interact);
  }

  render() {
    let bob = null;
    switch (this.state.mode) {
      case 'RunBackend':
        bob = (
          <div>
            Alice will deploy the contract.
            <br />
            Ask Alice for her contract info and paste it here:
            <br />
            <textarea
              onChange={(e) => this.ctcInfoStrChanged(e.currentTarget.value)}
              placeholder='{}'
            />
            <br />
            <button
              disabled={!this.state.ctcInfoStr}
              onClick={() => this.runBackend()}
            >Connect</button>
          </div>
        );
        break;
      case 'ApproveRequest':
        if (!this.state.requestStandard) {
          bob = (
            <p>
              Once Alice has submitted her requested amount,
              you will be prompted to pay it.
            </p>
          );
        } else {
          bob = (
            <p>
              You have received a prompt to pay Alice's requested amount.
            </p>
          );
        }
        break;
      case 'DisplayInfo':
        if (!this.state.info) {
          bob = (
            <p>
              Waiting for Alice to reveal her secret info...
            </p>
          );
        } else {
          bob = (
            <div>
              <p>
                Alice's secret info is: <strong>{this.state.info}</strong>
              </p>
              <p>
                Thank you, Bob. The contract has run to completion.
              </p>
            </div>
          );
        }
        break;
      default:
        bob = (
          <div>
            Sorry, Bob. Something went wrong.
            Please refresh the page.
          </div>
        );
    }

    return (
      <div className='Bob'>
        {bob}
      </div>
    );
  }
}

renderDOM();
