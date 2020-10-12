import React from 'react';
import * as reach from '@reach-sh/stdlib/ETH';
import sleep from './sleep';

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