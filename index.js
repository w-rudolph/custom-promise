"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isFunc(fn) {
    return typeof fn === 'function';
}
function isObj(fn) {
    return typeof fn === 'object';
}
var PromiseStatus;
(function (PromiseStatus) {
    PromiseStatus["PENDING"] = "pending";
    PromiseStatus["RESOLVED"] = "resolved";
    PromiseStatus["REJECTED"] = "rejected";
})(PromiseStatus = exports.PromiseStatus || (exports.PromiseStatus = {}));
class Promise {
    constructor(excutor) {
        this.status = PromiseStatus.PENDING;
        this.value = void 0;
        this.reason = void 0;
        this.rejectedCallbacks = [];
        this.resolvedCallbacks = [];
        this._resolve = this._resolve.bind(this);
        this._reject = this._reject.bind(this);
        if (!isFunc(excutor)) {
            throw new TypeError(`Promise resolver ${excutor} is not a function`);
        }
        try {
            excutor(this._resolve, this._reject);
        }
        catch (e) {
            this._reject(e);
        }
    }
    _resolve(value) {
        if (this.status === PromiseStatus.PENDING) {
            this.value = value;
            this.status = PromiseStatus.RESOLVED;
            this.resolvedCallbacks.forEach(fn => fn(this.value));
        }
    }
    _reject(reason) {
        if (this.status === PromiseStatus.PENDING) {
            this.reason = reason;
            this.status = PromiseStatus.REJECTED;
            this.rejectedCallbacks.forEach(fn => fn(this.reason));
        }
    }
    then(onFulfilled, onRejected) {
        if (!isFunc(onFulfilled)) {
            onFulfilled = val => val;
        }
        if (!isFunc(onRejected)) {
            onRejected = err => {
                throw err;
            };
        }
        const promise2 = new Promise((resolve, reject) => {
            if (this.status === PromiseStatus.RESOLVED) {
                setTimeout(() => {
                    try {
                        const x = onFulfilled(this.value);
                        Promise.resolvePromise(promise2, x, resolve, reject);
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            }
            if (this.status === PromiseStatus.REJECTED) {
                setTimeout(() => {
                    try {
                        const x = onRejected(this.reason);
                        Promise.resolvePromise(promise2, x, resolve, reject);
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            }
            if (this.status === PromiseStatus.PENDING) {
                this.resolvedCallbacks.push((val) => {
                    setTimeout(() => {
                        try {
                            Promise.resolvePromise(promise2, onFulfilled(val), resolve, reject);
                        }
                        catch (e) {
                            reject(e);
                        }
                    });
                });
                this.rejectedCallbacks.push((reason) => {
                    setTimeout(() => {
                        try {
                            Promise.resolvePromise(promise2, onRejected(reason), resolve, reject);
                        }
                        catch (e) {
                            reject(e);
                        }
                    });
                });
            }
        });
        return promise2;
    }
    static resolvePromise(promise2, x, resolve, reject) {
        if (promise2 === x) {
            return reject(new TypeError('Chaining cycle detected for promise'));
        }
        let called = false;
        if (x !== null && (isObj(x) || isFunc(x))) {
            try {
                const then = x.then;
                if (isFunc(then)) {
                    then.call(x, (val) => {
                        if (called)
                            return;
                        called = true;
                        Promise.resolvePromise(promise2, val, resolve, reject);
                    }, (err) => {
                        if (called)
                            return;
                        called = true;
                        reject(err);
                    });
                }
                else {
                    resolve(x);
                }
            }
            catch (e) {
                if (called)
                    return;
                called = true;
                reject(e);
            }
        }
        else {
            resolve(x);
        }
    }
    catch(onRejected) {
        return this.then(null, onRejected);
    }
    finally(callback) {
        return this.then(value => Promise.resolve(callback()).then(() => value), reason => Promise.reject(callback()).then(() => {
            throw reason;
        }));
    }
    static resolve(value) {
        return new Promise(resolve => {
            resolve(value);
        });
    }
    static reject(reason) {
        return new Promise((_, reject) => {
            reject(reason);
        });
    }
    static race(promises) {
        return new Promise((resolve, reject) => {
            promises.forEach(promise => {
                promise.then(resolve, reject);
            });
        });
    }
    static all(promises) {
        let i = 0;
        const ret = [];
        const handlePromise = (index, value, resolve) => {
            ret[index] = value;
            i++;
            if (i === promises.length) {
                resolve(ret);
            }
        };
        return new Promise((resolve, reject) => {
            promises.forEach((promise, idx) => {
                promise.then(value => {
                    handlePromise(idx, value, resolve);
                }, reject);
            });
        });
    }
}
exports.default = Promise;
