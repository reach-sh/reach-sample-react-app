// Automatically generated with Reach 0.1.2
export const _version = '0.1.2';

export async function Alice(stdlib, ctc, interact) {
  const txn1 = await ctc.sendrecv('Alice', 1, 1, [stdlib.T_UInt], [stdlib.protect(stdlib.T_UInt, interact.request, null)], stdlib.checkedBigNumberify('./index.rsh:18:25:after expr stmt semicolon', stdlib.UInt_max, 0), [stdlib.T_UInt], false, ((txn1) => {
    const sim_r = { txns: [] };
    sim_r.prevSt = stdlib.digest(stdlib.checkedBigNumberify('./index.rsh:18:8:dot', stdlib.UInt_max, 0));
    const [v1] = txn1.data;
    const v3 = txn1.value;
    const v2 = txn1.from;
    
    const v4 = stdlib.eq(v3, stdlib.checkedBigNumberify('./index.rsh:decimal', stdlib.UInt_max, 0));
    stdlib.assert(v4, {
      at: './index.rsh:18:25:after expr stmt semicolon',
      fs: [],
      msg: 'pay amount correct',
      who: 'Alice' });
    sim_r.nextSt = stdlib.digest(stdlib.checkedBigNumberify('./index.rsh:19:15:after expr stmt semicolon', stdlib.UInt_max, 1), v2, v1);
    sim_r.isHalt = false;
    return sim_r; }));
  const [v1] = txn1.data;
  const v3 = txn1.value;
  const v2 = txn1.from;
  const v4 = stdlib.eq(v3, stdlib.checkedBigNumberify('./index.rsh:decimal', stdlib.UInt_max, 0));
  stdlib.assert(v4, {
    at: './index.rsh:18:25:after expr stmt semicolon',
    fs: [],
    msg: 'pay amount correct',
    who: 'Alice' });
  const txn2 = await ctc.recv('Alice', 2, 0, [], false);
  const [] = txn2.data;
  const v12 = txn2.value;
  const v11 = txn2.from;
  const v13 = stdlib.eq(v12, v1);
  stdlib.assert(v13, {
    at: './index.rsh:23:21:after expr stmt semicolon',
    fs: [],
    msg: 'pay amount correct',
    who: 'Alice' });
  const txn3 = await ctc.sendrecv('Alice', 3, 1, [stdlib.T_Address, stdlib.T_UInt, stdlib.T_Bytes], [v2, v1, stdlib.protect(stdlib.T_Bytes, interact.info, null)], stdlib.checkedBigNumberify('./index.rsh:28:22:after expr stmt semicolon', stdlib.UInt_max, 0), [stdlib.T_Bytes], false, ((txn3) => {
    const sim_r = { txns: [] };
    sim_r.prevSt = stdlib.digest(stdlib.checkedBigNumberify('./index.rsh:28:8:dot', stdlib.UInt_max, 2), v2, v1);
    const [v19] = txn3.data;
    const v20 = txn3.value;
    
    const v21 = stdlib.eq(v20, stdlib.checkedBigNumberify('./index.rsh:decimal', stdlib.UInt_max, 0));
    stdlib.assert(v21, {
      at: './index.rsh:28:22:after expr stmt semicolon',
      fs: [],
      msg: 'pay amount correct',
      who: 'Alice' });
    sim_r.txns.push({
      amt: v1,
      to: v2 });
    sim_r.nextSt = stdlib.digest();
    sim_r.isHalt = true;
    return sim_r; }));
  const [v19] = txn3.data;
  const v20 = txn3.value;
  const v21 = stdlib.eq(v20, stdlib.checkedBigNumberify('./index.rsh:decimal', stdlib.UInt_max, 0));
  stdlib.assert(v21, {
    at: './index.rsh:28:22:after expr stmt semicolon',
    fs: [],
    msg: 'pay amount correct',
    who: 'Alice' });
  ;
  return; }
export async function Bob(stdlib, ctc, interact) {
  const txn1 = await ctc.recv('Bob', 1, 1, [stdlib.T_UInt], false);
  const [v1] = txn1.data;
  const v3 = txn1.value;
  const v2 = txn1.from;
  const v4 = stdlib.eq(v3, stdlib.checkedBigNumberify('./index.rsh:decimal', stdlib.UInt_max, 0));
  stdlib.assert(v4, {
    at: './index.rsh:18:25:after expr stmt semicolon',
    fs: [],
    msg: 'pay amount correct',
    who: 'Bob' });
  stdlib.protect(stdlib.T_Null, await interact.want(v1), {
    at: './index.rsh:22:22:application',
    fs: ['at ./index.rsh:22:35:after expr stmt semicolon call to "function" (defined at: ./index.rsh:21:17:function exp)'],
    msg: 'want',
    who: 'Bob' });
  const txn2 = await ctc.sendrecv('Bob', 2, 0, [stdlib.T_Address, stdlib.T_UInt], [v2, v1], v1, [], false, ((txn2) => {
    const sim_r = { txns: [] };
    sim_r.prevSt = stdlib.digest(stdlib.checkedBigNumberify('./index.rsh:23:8:dot', stdlib.UInt_max, 1), v2, v1);
    const [] = txn2.data;
    const v12 = txn2.value;
    const v11 = txn2.from;
    
    const v13 = stdlib.eq(v12, v1);
    stdlib.assert(v13, {
      at: './index.rsh:23:21:after expr stmt semicolon',
      fs: [],
      msg: 'pay amount correct',
      who: 'Bob' });
    sim_r.nextSt = stdlib.digest(stdlib.checkedBigNumberify('./index.rsh:24:15:after expr stmt semicolon', stdlib.UInt_max, 2), v2, v1);
    sim_r.isHalt = false;
    return sim_r; }));
  const [] = txn2.data;
  const v12 = txn2.value;
  const v11 = txn2.from;
  const v13 = stdlib.eq(v12, v1);
  stdlib.assert(v13, {
    at: './index.rsh:23:21:after expr stmt semicolon',
    fs: [],
    msg: 'pay amount correct',
    who: 'Bob' });
  const txn3 = await ctc.recv('Bob', 3, 1, [stdlib.T_Bytes], false);
  const [v19] = txn3.data;
  const v20 = txn3.value;
  const v21 = stdlib.eq(v20, stdlib.checkedBigNumberify('./index.rsh:decimal', stdlib.UInt_max, 0));
  stdlib.assert(v21, {
    at: './index.rsh:28:22:after expr stmt semicolon',
    fs: [],
    msg: 'pay amount correct',
    who: 'Bob' });
  ;
  stdlib.protect(stdlib.T_Null, await interact.got(v19), {
    at: './index.rsh:33:21:application',
    fs: ['at ./index.rsh:33:31:after expr stmt semicolon call to "function" (defined at: ./index.rsh:32:17:function exp)'],
    msg: 'got',
    who: 'Bob' });
  return; }

const _ETH = {
  ABI: `[
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "v1",
              "type": "uint256"
            }
          ],
          "internalType": "struct ReachContract.a1",
          "name": "_a",
          "type": "tuple"
        }
      ],
      "stateMutability": "payable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "v1",
          "type": "uint256"
        }
      ],
      "name": "e1",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [],
      "name": "e2",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "bytes",
          "name": "v19",
          "type": "bytes"
        }
      ],
      "name": "e3",
      "type": "event"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "_last",
              "type": "uint256"
            },
            {
              "internalType": "address payable",
              "name": "v2",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "v1",
              "type": "uint256"
            }
          ],
          "internalType": "struct ReachContract.a2",
          "name": "_a",
          "type": "tuple"
        }
      ],
      "name": "m2",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "_last",
              "type": "uint256"
            },
            {
              "internalType": "address payable",
              "name": "v2",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "v1",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "v19",
              "type": "bytes"
            }
          ],
          "internalType": "struct ReachContract.a3",
          "name": "_a",
          "type": "tuple"
        }
      ],
      "name": "m3",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    }
  ]`,
  Bytecode: `0x60806040526040516104b43803806104b48339810160408190526100229161009e565b341561002d57600080fd5b80516040517f3680e78b6fdf571695c81f108d81181ea63f50c100e6375e765b14bd7ac0adbb9161005d916100da565b60405180910390a1805160405161007d91600191439133916020016100e3565b60408051601f19818403018152919052805160209091012060005550610107565b6000602082840312156100af578081fd5b604051602081016001600160401b03811182821017156100cd578283fd5b6040529151825250919050565b90815260200190565b93845260208401929092526001600160a01b03166040830152606082015260800190565b61039e806101166000396000f3fe6080604052600436106100295760003560e01c806321730c631461002e5780639cb54e4014610043575b600080fd5b61004161003c366004610291565b610056565b005b61004161005136600461027a565b610178565b6002813561006a604084016020850161024c565b836040013560405160200161008294939291906102f8565b6040516020818303038152906040528051906020012060001c600054146100a857600080fd5b6100b8604082016020830161024c565b6001600160a01b0316336001600160a01b0316146100d557600080fd5b34156100e057600080fd5b6100f0604082016020830161024c565b6001600160a01b03166108fc82604001359081150290604051600060405180830381858888f1935050505015801561012c573d6000803e3d6000fd5b507fc65a85ba7eeba425db1b78f7a7e675c7110ba1276d025effd7ccf97de4fb260a61015b606083018361031c565b6040516101699291906102c9565b60405180910390a16000805533ff5b6001813561018c604084016020850161024c565b83604001356040516020016101a494939291906102f8565b6040516020818303038152906040528051906020012060001c600054146101ca57600080fd5b806040013534146101da57600080fd5b6040517f9b31f9e88fd11f71bfbf93b0237bc9a0900b8479a307f60435e40543e383403590600090a1600243610216604084016020850161024c565b836040013560405160200161022e94939291906102f8565b60408051601f19818403018152919052805160209091012060005550565b60006020828403121561025d578081fd5b81356001600160a01b0381168114610273578182fd5b9392505050565b60006060828403121561028b578081fd5b50919050565b6000602082840312156102a2578081fd5b813567ffffffffffffffff8111156102b8578182fd5b820160808185031215610273578182fd5b60006020825282602083015282846040840137818301604090810191909152601f909201601f19160101919050565b93845260208401929092526001600160a01b03166040830152606082015260800190565b6000808335601e19843603018112610332578283fd5b83018035915067ffffffffffffffff82111561034c578283fd5b60200191503681900382131561036157600080fd5b925092905056fea2646970667358221220808e54837a922d5b49b880730e68407437a456d2e021a5e10ad3a3a16cb1761664736f6c63430007010033`,
  deployMode: `DM_firstMsg` };

export const _Connectors = {
  ETH: _ETH };
