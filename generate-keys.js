const axios = require('axios');

const SERVER_URL = 'http://localhost:5050';

async function generateKeys(count, name, email) {
    try {
        const response = await axios.post(`${SERVER_URL}/admin/generate`, {
            count: count || 1,
            email: email || 'test@example.com',
            customerName: name || 'General Customer',
            planType: 'Pro',
            billingCycle: 'Yearly',
            expiryMonths: 12
        });
        
        if (response.data.success) {
            console.log('✅ Keys generated successfully:');
            response.data.keys.forEach(key => console.log(` - ${key}`));
        }
    } catch (error) {
        console.error('❌ Failed to generate keys. Is the server running?');
    }
}

const args = process.argv.slice(2);
const count = parseInt(args[0]) || 1;
const name = args[1];

generateKeys(count, name);
