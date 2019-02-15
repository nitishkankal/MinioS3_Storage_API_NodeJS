 

function doSomethingAsync(value) {
    return new Promise((resolve,reject) => {
      setTimeout(() => {
        console.log("Resolving " + value);
        resolve(value);
      }, Math.floor(Math.random() * 1000));
    });
  }
  
  function test() {
    let i;
    let promises = [];
    
    for (i = 0; i < 5; ++i) {
      promises.push(doSomethingAsync(i));
    }
    
    Promise.all(promises)
        .then((results) => {
          console.log("All done", results);
        })
        .catch((e) => {
            // Handle errors here
        });
  }
  test();