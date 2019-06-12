const { MyPromise } = require('../index');

function delay(ms, msg) {
    return new MyPromise(resolve => {
        setTimeout(() => {
            resolve(msg);
        }, ms);
    });
}

describe('MyPromise test case', () => {
    test('Create a instance', () => {
        return new MyPromise((resolve) => {
            resolve('Hello');
        }).then(r => {
            expect(r).toBe('Hello');
        });
    });

    test('Promise reject', () => {
        return MyPromise.reject('reject').catch((err) => {
            expect(err).toBe('reject');
        });
    });

    test('Promise all', () => {
        return MyPromise.all([MyPromise.resolve(1), MyPromise.resolve(2)]).then(r => {
            expect(r).toEqual([1, 2]);
        });
    });

    test('Promise async all', () => {
        return expect(MyPromise.all([delay(100, 'A'), delay(50, 'B')])).resolves.toEqual(['A', 'B']);
    });

    test('Promise race', () => {
        return expect(MyPromise.race([delay(100, 'A'), delay(50, 'B')])).resolves.toBe('B');
    });
});
