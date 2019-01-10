//import {init} from './lib/index';

import {init} from './lib/index';


const mamInit = async (provider,seed) => {
    return new Promise((resolve,reject) => {
        const obj = init(provider, seed, 2);
        console.log(obj);
        resolve(obj);
    });
    
}

/*const mamChangeMode = async(state,mode,key) => {
    Mam.changeMode(state, mode, key)
}*/


export {mamInit};