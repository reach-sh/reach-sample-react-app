import React from 'react';
import * as backend from './build/index.main.mjs';
import * as reach from '@reach-sh/stdlib/ETH';
import CtcInfo from './CtcInfo';

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

export default Alice;