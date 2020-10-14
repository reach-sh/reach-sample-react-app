import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as AppViews from './views/AppViews';
import * as backend from './build/index.main.mjs';
import * as reach from '@reach-sh/stdlib/ETH';

const sleep = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds));
const defaultFundAmtStandard = '10';
const defaultInfo = 'the cake is a lie';
const defaultRequestStandard = '0.5';

function renderDOM() {
  ReactDOM.render(
    <React.StrictMode><App /></React.StrictMode>,
    document.getElementById('root')
  );
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {mode: 'ConnectAccount'}
  }
  async componentDidMount() { // from mode: ConnectAccount
    const acc = await reach.getDefaultAccount();
    const addr = await acc.networkAccount.getAddress();
    const balAtomic = await reach.balanceOf(acc);
    const bal = reach.formatCurrency(balAtomic, 4);
    try {
      const faucet = await reach.getFaucet();
      this.setState({mode: 'FundAccount', acc, addr, bal, faucet});
    } catch (e) {
      this.setState({mode: 'SelectRole', acc, addr, bal});
    }
  }
  fundAccount(fundAmountStandard) { // from mode: FundAccount
    const {faucet, acc} = this.state;
    const amountAtomic = reach.parseCurrency(fundAmountStandard || defaultFundAmtStandard);
    reach.transfer(faucet, acc, amountAtomic);
    this.setState({mode: 'SelectRole'});
  }
  skipFundAccount() { this.setState({mode: 'SelectRole'}); } // from mode: FundAccount
  selectRole(role) { this.setState({mode: 'RunRole', role}); } // from mode: SelectRole
  selectBob() { this.selectRole(<Bob acc={this.state.acc} />); }
  selectAlice() { this.selectRole(<Alice acc={this.state.acc} />); }
  render() {
    const {addr, bal, role} = this.state;
    const {standardUnit} = reach;
    const parent = this;
    let app = null;
    if (this.state.mode === 'ConnectAccount') {
      const renderProps = {parent};
      app = <AppViews.ConnectAccount renderProps={renderProps} />
    } else if (this.state.mode === 'FundAccount') {
      const renderProps = {parent, addr, bal, standardUnit, defaultFundAmtStandard};
      app = <AppViews.FundAccount renderProps={renderProps} />
    } else if (this.state.mode === 'SelectRole') {
      const renderProps = {parent};
      app = <AppViews.SelectRole renderProps={renderProps} />
    } else { // 'RunRole'
        app = role;
    }
    return <AppViews.Wrapper app={app} />;
  }
}


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

              <pre className='ContractInfo'>
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
              className='ContractInfo'
              spellCheck='false'
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
