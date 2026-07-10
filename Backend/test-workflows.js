const API_URL = 'http://localhost:5005/api';

async function runTests() {
    console.log('--- Starting API Tests ---');

    console.log('\n1. Submitting Anonymous Report...');
    try {
        const payload = {
            violation_type: 'Water pollution',
            description: 'Test anonymous report',
            location_name: 'Test Lake',
            latitude: 6.9271,
            longitude: 79.8612,
            district: 'Colombo'
        };
        const res = await fetch(`${API_URL}/complaints`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Response:', data);
    } catch (err) {
        console.error('Failed:', err.message);
    }

    console.log('\n2. Fetching Public Stats...');
    try {
        const res = await fetch(`${API_URL}/complaints/stats`);
        const data = await res.json();
        console.log('Status:', res.status);
        console.log('Response:', data);
    } catch (err) {
        console.error('Failed:', err.message);
    }
}

runTests();
