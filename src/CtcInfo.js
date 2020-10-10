import React from 'react';
import sleep from './sleep';

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

export default CtcInfo;