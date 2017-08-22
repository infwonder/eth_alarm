module.exports = function unlockToPay(txObj, password, web3) {
    const self = this;
    const unlockViaIPC = function(resolve, reject) {
        self.personal.unlockAccount(txObj.from, password, (error, result) => {
            if (error) {
                reject(error);
            } else if (result != true) {
                setTimeout( () => unlockViaIPC(resolve, reject), 500 );
            } else {
                resolve(web3.eth.sendTransaction(txObj));
            }
        });
    };

    return new Promise(unlockViaIPC);
};
