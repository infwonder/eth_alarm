'use strict';

var Web3 = require('web3');

const net  = require('net');
const os   = require('os');
const path = require('path');

module.exports = 
{
  rpcAddr: 'http://127.0.0.1:8545',
  ipcPath: path.join(os.homedir(), '.ethereum', 'geth.ipc'),
  web3: undefined,

  factory: function()
  {
    module.exports.web3 = new Web3();
    module.exports.web3.setProvider(new Web3.providers.HttpProvider(module.exports.rpcAddr));
    module.exports.web3.getTransactionReceiptMined = require('./txReceiptMined.js');
    return module.exports.web3;
  },

  payment: function(from, to, value, passwd)
  {
    var ipc3 = new Web3();
    ipc3.setProvider(new Web3.providers.IpcProvider(module.exports.ipcPath, net));
    ipc3.unlockToPay = require('./unlockViaIPC.js');

    return ipc3.unlockToPay(from, to, value, passwd, module.exports.web3)
    .then((tx) =>
    {
      ipc3.personal.lockAccount(from, (e,r) =>
      {
        if(e) throw(e);
        ipc3.net._requestManager.provider.connection.destroy();
      });
      return {txHash: tx, issuedBlock: module.exports.web3.eth.blockNumber, mined: false};
    })
    .catch((err) => { throw(err) });  
  },

  receipt: function(txhash)
  {
    return module.exports.web3.getTransactionReceiptMined(txhash, 500)
    .then( (r) =>
    {
      return { txHash: r.txHash, minedBlock: r.blockNumber }
    })
    .catch((err) => { throw(err); });  
  }
};
