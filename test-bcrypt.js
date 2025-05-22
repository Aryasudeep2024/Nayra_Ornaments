// test-bcrypt.js
const bcrypt = require('bcrypt');

const hashFromDB = "$2b$10$SJUNLF89TBbAfZVBp9wOue7iOWMiPVmapU/tGJndE/W3zHgBRVFyC";
const inputPassword = "admin123";

bcrypt.compare(inputPassword, hashFromDB)
  .then(result => console.log("Password match:", result))
  .catch(err => console.error("Error:", err));
