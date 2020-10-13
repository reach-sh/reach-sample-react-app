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
    this.state = {
      isBob: false,
    }
  }

  swapRoles() {
    this.setState({isAlice: !this.state.isAlice});
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <FundMe />
          <button
            style={{fontSize: '32px'}}
            onClick={() => this.setState({isBob: !this.state.isBob})}>
            Swap roles
          </button>

          {this.state.isBob ? <Bob /> : <Alice />}
        </header>
      </div>
    );
  }
}

class FundMe extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      acc: undefined,
      bal: undefined,
      funding: false,
    }
  }

  async componentDidMount() {
    const acc = await reach.getDefaultAccount();
    this.setState({acc});
  }

  componentDidUpdate(oldProps, oldState) {
    if (this.state.acc !== oldState.acc) {
      this.refreshBal();
    }
  }

  async refreshBal() {
    const bal = await reach.balanceOf(this.state.acc);
    this.setState({bal});
  }

  emptyBalHuh() {
    const {acc, bal} = this.state;
    if (!bal) return false;
    console.log(bal.toString());
    return acc && bal && !bal.gt(0);
  }

  async fundMe() {
    const {acc} = this.state;
    this.setState({funding: true});
    const faucet = await reach.getFaucet();
    await reach.transfer(faucet, acc, reach.parseCurrency('100'));
    await sleep(1000); // XXX
    this.refreshBal();
  }

  render() {
    if (this.emptyBalHuh()) {
      return (
        <div>
          I see your account is empty.
          If you are on a devnet, you can receive funds from the faucet.
          <br />
          <button
            style={{fontSize: '24px'}}
            onClick={() => this.fundMe()}
            disabled={this.state.funding}
          >Fund me</button>
        </div>
      )
    } else {
      return '';
    }
  }
}

export default FundMe


const defaultAmt = 5; // in the standard unit

class Alice extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      acc: undefined,
      ctc: undefined,
      deployed: undefined,
      deploying: undefined,
      running: undefined,
      ran: undefined,
      secret: undefined,
      amt: reach.parseCurrency(defaultAmt),
    };
  }

  async componentDidMount() {
    const acc = await reach.getDefaultAccount();
    this.setState({acc});
  }

  async deploy() {
    this.setState({deploying: true, running: false, ran: false});
    const {acc} = this.state;
    const ctc = await acc.deploy(backend);
    this.setState({ctc});
    await ctc.getInfo();
    this.setState({deploying: false, deployed: true});
  }

  async run() {
    const {ctc} = this.state;
    // XXX get Info from a text box or something
    const interact = {
      request: this.state.amt,
      info: this.state.secret,
    };
    this.setState({running: true, ran: false});
    await backend.Alice(reach, ctc, interact);
    this.setState({running: false, ran: true});
  }

  amountChanged(value) {
    if (!value && value !== 0) {
      this.setState({amt: undefined});
      return;
    }
    const amt = reach.parseCurrency(value);
    this.setState({amt}); // amt is BigNumber of WEI
  }

  textareaChanged(secret) {
    this.setState({secret});
  }

  render() {
    return (
      <div className="Alice">
        Current role: <strong>Alice</strong>.
        <br /> Requests payment from Bob in order to reveal a secret.
        <br /> Alice, what is your secret?
        <br />
        <textarea
          style={{fontSize: '24px'}}
          onChange={(e) => this.textareaChanged(e.currentTarget.value)}
        />
        <br />
        How much {reach.standardUnit} do you want in exchange for revealing this secret?
        <br />
        <input
          style={{fontSize: '24px'}}
          onChange={(e) => this.amountChanged(e.currentTarget.value)}
          type='number'
          defaultValue={defaultAmt}
        />
        <br />
        <br />
        <button
          disabled={
            !this.state.acc
            || this.state.deployed || this.state.deploying
          }
          style={{fontSize: '32px'}}
          onClick={() => this.deploy()}
        >Deploy</button>
        <button
          disabled={
            !this.state.acc
            || this.state.ran || this.state.running
            || !(this.state.deployed || this.state.deploying)
            || !this.state.secret || !this.state.amt
          }
          style={{fontSize: '32px'}}
          onClick={() => this.run()}
        >Run</button>
        <br />
        App state:
        {!(this.state.deployed || this.state.deploying) ? ' Waiting to deploy...' : ''}
        {this.state.deploying? ' Deploying...' : ''}
        {(! this.state.ran && this.state.deployed && !this.state.running) ? ' Waiting to run' : ''}
        {this.state.running ? ' Running...' : ''}
        {this.state.ran ? ' Completed' : ''}
        <CtcInfo ref={this.ctcInfoRef} ctc={this.state.ctc} />
      </div>
    );
  }
}

const defaultCopyButtonText = 'Copy to clipboard';

class CtcInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ctcInfoStr: 'no contract deployed',
      copyButtonText: defaultCopyButtonText,
      copyButtonDisabled: true,
    }
  }

  componentDidMount() {
    this.ctcDidUpdate();
  }

  componentDidUpdate(prevProps) {
    if ((this.props.ctc !== prevProps.ctc)) {
      this.ctcDidUpdate();
    }
  }

  async ctcDidUpdate() {
    const {ctc} = this.props;
    if (ctc) {
      const ctcInfoStr = 'deploying...';
      this.setState({ctcInfoStr});
      const ctcInfo = await ctc.getInfo()
      this.updateInfo(ctcInfo);
    }
  }

  updateInfo(ctcInfo) {
    const ctcInfoStr = JSON.stringify(ctcInfo, null, 2);
    this.setState({ctcInfoStr, copyButtonDisabled: false});
  }

  async copyCtcInfo() {
    navigator.clipboard.writeText(this.state.ctcInfoStr);
    this.setState({copyButtonText: 'Contract info copied!', copyButtonDisabled: true});
    await sleep(2000);
    this.setState({copyButtonText: defaultCopyButtonText, copyButtonDisabled: false})
  }

  render() {
    return (
      <div>
        Contract Info: <button disabled={this.state.copyButtonDisabled} onClick={() => this.copyCtcInfo()}>{this.state.copyButtonText}</button>
        <pre style={{fontSize: '12px', textAlign: 'left', border: '1px solid', padding: '5px'}}>
          {this.state.ctcInfoStr}
        </pre>
      </div>
    );
  }
}

class Bob extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      acc: undefined,
      ctc: undefined,
      ctcInfo: undefined,
      running: false,
      completed: false,
      attached: false,
      secret: 'click Attach and pay Alice to find out her secret',
    };
  }

  async componentDidMount() {
    const acc = await reach.getDefaultAccount();
    this.setState({acc});
  }

  pastedInfo(e) {
    // TODO: error handling
    const ctcInfo = JSON.parse(e.currentTarget.value);
    this.setState({ctcInfo});
  }

  async attach() {
    const ctc = this.state.acc.attach(backend, this.state.ctcInfo);
    const interact = {
      want: (amt) => {
        // No real need to interact this.
        // Bob is prompted by MetaMask when it's time to pay.
        console.log(amt);
      },
      got: (msgBytes) => {
        const secret = reach.hexToString(msgBytes);
        this.setState({secret});
      },
    };
    const secret = 'waiting for Alice to tell';
    this.setState({
      ctc, secret, attached: true, running: true, completed: false,
    });
    await backend.Bob(reach, ctc, interact);
    this.setState({running: false, completed: true});
  }

  render() {
    return (
      <div>
        Current role: <strong>Bob</strong>.
        <br /> Pays Alice in order for her to reveal a secret.
        <p>
          Paste Alice's contract info:
          <br />
          <textarea onChange={(e) => this.pastedInfo(e)} spellCheck='false' style={{minWidth: '750px', minHeight: '100px'}} />
        </p>
        <p>
          <button
            disabled={!this.state.ctcInfo || this.state.attached}
            onClick={() => this.attach()}
            style={{fontSize: '32px'}}
          >Attach</button>
        </p>
        App state:
        {!(this.state.running || this.state.completed) ? ' Waiting to attach...' : ''}
        {this.state.running ? ' Running...' : ''}
        {this.state.completed ? ' Completed' : ''}
        <p>
          Alice's secret:
          <br />
          <span>{this.state.secret}</span>
        </p>
      </div>
    );
  }
}

renderDOM();
