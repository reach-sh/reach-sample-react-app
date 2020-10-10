import React from 'react';
import logo from './logo.svg';
import './App.css';
import Alice from './Alice';
import Bob from './Bob';

window.ethereum.autoRefreshOnNetworkChange = false;

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
          <img src={logo} className="App-logo" alt="logo" />
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

export default App;
