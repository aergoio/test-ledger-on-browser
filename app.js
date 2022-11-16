import LedgerAppAergo from '@herajs/ledger-hw-app-aergo';
import Transport from '@ledgerhq/hw-transport-webusb';
import { AergoClient, GrpcWebProvider, Tx } from '@herajs/client';
import { hashTransaction } from '@herajs/crypto';

function log(description) {
    console.log(new Date().toISOString(), description);
    document.getElementById('result').innerHTML = description;
}

async function test_transaction() {
    log('creating AergoClient');
    const aergo = new AergoClient({}, new GrpcWebProvider({url: 'http://testnet-api.aergo.io:7845'}));
    log('creating transport');
    const transport = await Transport.create();  // removed: (3000, 1500)
    log('creating LedgerAppAergo');
    const app = new LedgerAppAergo(transport);
    const account_index = 4;
    const path = "m/44'/441'/0'/0/" + account_index;
    log('getting wallet address');
    const address = await app.getWalletAddress(path);
    console.log('address', address);
    log('getting chain id');
    const chainIdHash = await aergo.getChainIdHash();
    console.log('chainIdHash', chainIdHash);
    log('getting nonce');
    const nonce = await aergo.getNonce(address.value);
    console.log('nonce', nonce);
    log('building transaction');
    const tx = {
        from: address.toString(),
        to: 'AmMhNZVhirdVrgL11koUh1j6TPnH118KqxdihFD9YXHD63VpyFGu',
        type: Tx.Type.TRANSFER,
        amount: '100000000000000000 aer',
        nonce: nonce + 1,
        limit: 100000,
        chainIdHash: chainIdHash,
    };
    console.log('tx', tx);
    log('signing transaction');
    const result = await app.signTransaction(tx);
    tx.sign = result.signature;
    log('hashing transaction');
    tx.hash = await hashTransaction(tx, 'bytes');
    log('sending transaction');
    const txHash = await aergo.sendSignedTransaction(tx);
    log('transaction sent: ' + txHash);
    const txReceipt = await aergo.waitForTransactionReceipt(txHash);
    log('transaction receipt: ' + JSON.stringify(txReceipt));
}

window.test_transaction = test_transaction;
