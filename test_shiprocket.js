const https = require('https');

async function testShiprocketAuth() {
  const postData = JSON.stringify({
    email: 'nutnectar0@gmail.com',
    password: '6703@Yadav'
  });

  const options = {
    hostname: 'apiv2.shiprocket.in',
    port: 443,
    path: '/v1/external/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Origin': 'https://apiv2.shiprocket.in'
    }
  };

  const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (d) => { body += d; });
    res.on('end', () => {
      console.log('StatusCode:', res.statusCode);
      try {
        const json = JSON.parse(body);
        console.log('Response JSON:', json);
      } catch(e) {
        console.log('Raw body:', body);
      }
    });
  });

  req.on('error', (e) => {
    console.error('Request Error:', e);
  });

  req.write(postData);
  req.end();
}

testShiprocketAuth();
