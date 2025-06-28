const bcrypt = require('bcrypt');

const plainPassword = 'admin123';
const storedHash = '$2b$10$SJUNLF89TBbAfZVBp9wOue7iOWMiPVmapU/tGJndE/W3zHgBRVFyC';

bcrypt.compare(plainPassword, storedHash).then(match => {
  console.log("MATCH RESULT:", match); // Should be true if password is correct
});
