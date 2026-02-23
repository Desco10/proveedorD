const bcrypt = require('bcrypt');

const passwordPlana = 'Admin@2026!'; // 

bcrypt.hash(passwordPlana, 10)
  .then(hash => {
    console.log("HASH GENERADO:");
    console.log(hash);
  })
  .catch(err => console.error(err));