const Promise = require('../index').default;

function delay(ms, msg) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(msg);
        }, ms);
    });
}

describe('Promise test case', () => {
    test('Create a instance', () => {
        return new Promise((resolve) => {
            resolve('Hello');
        }).then(r => {
            expect(r).toBe('Hello');
        });
    });

    test('Promise reject', () => {
        return Promise.reject('reject').catch((err) => {
            expect(err).toBe('reject');
        });
    });

    test('Promise all', () => {
        return Promise.all([Promise.resolve(1), Promise.resolve(2)]).then(r => {
            expect(r).toEqual([1, 2]);
        });
    });

    test('Promise async all', () => {
        return expect(Promise.all([delay(100, 'A'), delay(50, 'B')])).resolves.toEqual(['A', 'B']);
    });

    test('Promise race', () => {
        return expect(Promise.race([delay(100, 'A'), delay(50, 'B')])).resolves.toBe('B');
    });
});
