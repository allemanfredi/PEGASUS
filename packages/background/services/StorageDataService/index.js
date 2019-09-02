//class used to encrypt the content of wallet data in order to make more difficult the decryption of the seed since is encrypted togheter with other data (ex name, address ecc)
//options, state, password hash and session(timestamp for checking the last login) are not encrypted
import Utils from '@pegasus/lib/utils';


class StorageDataService {

    constructor(encryptionkey){
        this.encryptionkey = encryptionkey;

        //check if is null
        const edata = localStorage.getItem('data');
        if ( !edata )
            this.setData({mainnet : [], testnet : []})
    }

    getData(){
        const edata = localStorage.getItem('data');
        const data = Utils.aes256decrypt(edata, this.encryptionkey);
        return JSON.parse(data);
    }

    setData(data) {
        const edata = Utils.aes256encrypt(JSON.stringify(data), this.encryptionkey);
        localStorage.setItem('data', edata);
        return;
    }
}

export default StorageDataService;