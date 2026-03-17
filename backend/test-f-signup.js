const testSignup = async () => {
    try {
        const res = await fetch('http://localhost:5000/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test Operative',
                email: `test${Date.now()}@civicfix.com`,
                password: 'password123',
                role: 'citizen'
            })
        });
        const data = await res.json();
        console.log('Signup Status:', res.status);
        console.log('Signup Response:', data);
    } catch (err) {
        console.error('Signup Error:', err.message);
    }
};

testSignup();
