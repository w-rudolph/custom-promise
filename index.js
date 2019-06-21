"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PromiseStatus;
(function (PromiseStatus) {
    PromiseStatus["PENDING"] = "pending";
    PromiseStatus["RESOLVED"] = "resolved";
    PromiseStatus["REJECTED"] = "rejected";
})(PromiseStatus = exports.PromiseStatus || (exports.PromiseStatus = {}));
const _catchErrorPromises = new Set();
class MyPromise {
    constructor(resolver) {
        if (new.target !== MyPromise) {
            throw new SyntaxError('Please use a new keyword to create promise!');
        }
        this._PromiseStatus = PromiseStatus.PENDING;
        this._PromiseValue = void 0;
        resolver(this._resolve.bind(this), this._reject.bind(this));
    }
    _resolve(val) {
        this._PromiseStatus = PromiseStatus.RESOLVED;
        this._PromiseValue = val;
    }
    _reject(val) {
        this._PromiseStatus = PromiseStatus.REJECTED;
        this._PromiseValue = val;
        _catchErrorPromises.add(this);
        setTimeout(() => {
            if (_catchErrorPromises.has(this)) {
                throw this._PromiseValue;
            }
        });
    }
    static resolve(val) {
        if (val instanceof MyPromise) {
            return val;
        }
        return new MyPromise((_resolve) => {
            _resolve(val);
        });
    }
    static reject(val) {
        return new MyPromise((_, _reject) => {
            _reject(val);
        });
    }
    _isCompleted() {
        return this._isResolved() || this._isResolved();
    }
    _isRejected() {
        return this._PromiseStatus === PromiseStatus.REJECTED;
    }
    _isResolved() {
        return this._PromiseStatus === PromiseStatus.RESOLVED;
    }
    then(resolve, reject) {
        if (typeof resolve !== 'function') {
            return this;
        }
        if (this._isRejected())
            return MyPromise.reject(this._PromiseValue);
        if (this._isResolved()) {
            return this._runUntilResolve(resolve, reject);
        }
        else {
            return new MyPromise((_resolve, _reject) => {
                const timer = setInterval(() => {
                    if (this._isCompleted()) {
                        clearInterval(timer);
                    }
                    const ret = this._runUntilResolve(resolve, reject);
                    if (ret && ret._isResolved()) {
                        _resolve(ret._PromiseValue);
                    }
                    if (ret && ret._isRejected()) {
                        _reject(ret._PromiseValue);
                    }
                });
            });
        }
    }
    _runUntilResolve(resolve, reject) {
        if (this._isCompleted()) {
            let _error = null;
            let _val;
            try {
                _val = resolve(this._PromiseValue);
            }
            catch (err) {
                _error = err;
            }
            if (_error) {
                if (typeof reject === 'function') {
                    reject(_error);
                }
                return MyPromise.reject(_error);
            }
            return MyPromise.resolve(_val);
        }
    }
    catch(onCatch) {
        if (this._isResolved())
            return this;
        const promise = MyPromise.resolve(onCatch(this._PromiseValue));
        _catchErrorPromises.delete(this);
        return promise;
    }
    finally(onFinally) {
        return this.then(val => {
            onFinally(val);
            return val;
        }, err => {
            onFinally(err);
            return err;
        });
    }
    static all(promises) {
        return new MyPromise((reslove, reject) => {
            const timer = setInterval(() => {
                promises = promises.map(p => {
                    if (!(p instanceof MyPromise)) {
                        return MyPromise.resolve(p);
                    }
                    return p;
                });
                const rt = promises.find(p => p._isRejected());
                if (rt) {
                    return reject(rt._PromiseValue);
                }
                if (promises.every(p => p._isResolved())) {
                    clearInterval(timer);
                    return reslove(promises.map(p => p._PromiseValue));
                }
            });
        });
    }
    static race(promises) {
        return new MyPromise((reslove, reject) => {
            const timer = setInterval(() => {
                promises = promises.map(p => {
                    if (!(p instanceof MyPromise)) {
                        return MyPromise.resolve(p);
                    }
                    return p;
                });
                const resolveOne = promises.find(p => p._isResolved());
                if (resolveOne) {
                    clearInterval(timer);
                    return reslove(resolveOne._PromiseValue);
                }
                const rejectOne = promises.find(p => p._isRejected());
                if (rejectOne) {
                    clearInterval(timer);
                    return reject(rejectOne._PromiseValue);
                }
            });
        });
    }
}
exports.MyPromise = MyPromise;
