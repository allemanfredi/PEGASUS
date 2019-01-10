import {init,changeMode,create,decode,attach,fetch} from './lib/index';


const mamInit = async (provider,seed) => {
    return new Promise((resolve,reject) => {
        const obj = init(provider, seed, 2);
        resolve(obj);
    });
}

const mamChangeMode = async(state,mode,key) => {
    return new Promise((resolve,reject) => {
        const state = changeMode(state, mode, key);
        resolve(state);
    });
}

const mamCreate = async (state,mode,key) => {
    return new Promise((resolve,reject) => {
        const message = create(state, mode, key);
        resolve(message);
    });
}

const mamDecode = async (payload,sideKey,root) => {
    return new Promise((resolve,reject) => {
        const message = decode(payload, sideKey, root)
        resolve(message);
    });
}

const mamAttach = async (payload,address) => {
    return new Promise(async (resolve,reject) => {
        const transaction = await attach(payload, address)
        resolve(transaction);
    });
}

const mamFetch = async (root,mode,sideKey) => {
    return new Promise(async (resolve,reject) => {
        const obj = await fetch(root,mode,sideKey);
        resolve(obj);
    });
}

export {mamInit,
        mamAttach,
        mamChangeMode,
        mamCreate,
        mamDecode,
        mamFetch};