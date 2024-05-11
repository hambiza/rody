const express = require('express');

const app = express()

// first step.

app.get('signin', () => {});
app.post('register', () => {});

// step two:
//
app.get('client_info', () => {

  //TODO get contract info from blockchain.
});


// step three:
app.get('assurnce', () => {})
app.post('assurnce', () => {

  // TODO create smart contract.

  // TODO publihs contract into blockcahin.
});


app.listen(8000, () => {
  console.log('Server started!')
})


/*
- JavaScript before 2015:
    const expree = require('express')

- JavaScript post 2015 ES2015
    async await
    import {} from ''
*/
