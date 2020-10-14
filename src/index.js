import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as AppViews from './views/AppViews';
import * as AliceViews from './views/AliceViews';
import * as backend from './build/index.main.mjs';
import * as reach from '@reach-sh/stdlib/ETH';

const {standardUnit} = reach;
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
    const {mode, addr, bal, role} = this.state;
    const parent = this;
    let app = null;
    if (mode === 'ConnectAccount') {
      console.log(parent);
      app = <AppViews.ConnectAccount />
    } else if (mode === 'FundAccount') {
      app = <AppViews.FundAccount {...{parent, addr, bal, standardUnit, defaultFundAmtStandard}} />
    } else if (mode === 'SelectRole') {
      app = <AppViews.SelectRole {...{parent}} />
    } else { // 'RunRole'
      app = role;
    }
    return <AppViews.Wrapper {...{app}} />;
  }
}

class Alice extends React.Component {
  constructor(props) {
    super(props);
    this.state = { mode: 'Deploy'};
  }
  async deploy() { // from mode: Deploy
    const ctc = this.props.acc.deploy(backend);
    this.setState({mode: 'EnterInfo', ctc});
    const ctcInfoStr = JSON.stringify(await ctc.getInfo(), null, 2);
    this.setState({ctcInfoStr});
  }
  enterInfo(info) { this.setState({mode: 'EnterRequest', info}); } // from mode: EnterInfo
  enterRequest(requestStandard) { this.setState({mode: 'RunBackend', requestStandard}); } // from mode: EnterRequest
  async runBackend() { // from mode: RunBackend
    const {ctc, requestStandard, info} = this.state;
    this.setState({mode: 'BackendRunning'});
    const request = reach.parseCurrency(requestStandard);
    await backend.Alice(reach, ctc, {request, info});
    this.setState({mode: 'BackendRan'});
  }
  render() {
    let alice = null;
    const parent = this;
    const {mode, ctcInfoStr, requestStandard, info} = this.state;
    if (mode === 'Deploy') {
      alice = <AliceViews.Deploy {...{parent}} />;
    } else if (mode === 'EnterInfo') {
      alice = <AliceViews.EnterInfo {...{parent, defaultInfo}} />;
    } else if (mode === 'EnterRequest') {
      alice = <AliceViews.EnterRequest {...{parent, standardUnit, defaultRequestStandard}} />;
    } else if (mode === 'RunBackend') {
      alice = <AliceViews.RunBackend {...{parent, info, requestStandard, standardUnit}} />;
    } else if (mode === 'BackendRunning') {
      alice = <AliceViews.BackendRunning {...{ctcInfoStr}} />;
    } else { // 'BackendRan'
      alice = <AliceViews.BackendRan />;
    }
    return <AliceViews.AliceWrapper {...{alice}} />
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
    const interact = {
      want: (request) => this.setState({mode: 'DisplayInfo', requestStandard: reach.formatCurrency(request, 4)}),
      got: (infoBytes) => this.setState({info: reach.hexToString(infoBytes)}),
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
