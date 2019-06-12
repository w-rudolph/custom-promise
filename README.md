# Custom promise

### constructor
```
new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve("Hello");
  });
})
```

### static 
* MyPromise.reject
* MyPromise.resolve
* MyPromise.all
* MyPromise.race

### instance
* then
* catch
* finally
