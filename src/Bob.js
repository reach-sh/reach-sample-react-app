import React from 'react';
import * as backend from './build/index.main.mjs';
import * as reach from '@reach-sh/stdlib/ETH';

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

export default Bob;
