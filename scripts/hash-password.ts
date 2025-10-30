import { hash } from 'bcryptjs';

async function hashPassword() {
  const password = 'wohxaB-dangyq-xuxxy0';
  const hashed = await hash(password, 12);
  console.log('Hashed password:');
  console.log(hashed);
}

hashPassword();
