const axios = require('axios');

const testSignup = async () => {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/signup', {
            name: 'Test User',
            email: `test${Date.now()}@example.com`,
            password: 'password123',
            role: 'citizen'
        });
        console.log('Signup Successful:', res.data);
    } catch (err) {
        console.error('Signup Failed:', err.response ? err.response.data : err.message);
    }
};

testSignup();
