const bcrypt = require('bcryptjs');

async function test() {
  const password = 'arya@2025';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  console.log('Hash:', hash);

  const match = await bcrypt.compare(password, hash);
  console.log('Password match:', match);
}

test();
