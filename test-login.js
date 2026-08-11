const axios = require('axios');

async function testLogin() {
  try {
    const res = await axios.post('http://localhost:5000/users/signin', {
      email: 'farhankhalid.hello2@gmail.com',
      password: 'password123'
    });
    console.log("RESPONSE:", JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error("ERROR:", err.response ? err.response.data : err.message);
  }
}

testLogin();
