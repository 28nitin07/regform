/**
 * Test script for registration confirmation webhook
 * 
 * Usage: node scripts/test-webhook.js [paymentId]
 * Example: node scripts/test-webhook.js 675bb30f6dee5e5cfb0d5ef3
 */

const paymentId = process.argv[2];

if (!paymentId) {
  console.error('❌ Error: Payment ID is required');
  console.log('Usage: node scripts/test-webhook.js <paymentId>');
  console.log('Example: node scripts/test-webhook.js 675bb30f6dee5e5cfb0d5ef3');
  process.exit(1);
}

const url = 'http://localhost:3000/api/payments/verify';
const payload = {
  paymentId: paymentId,
  sendEmail: 'Yes'
};

console.log('🧪 Testing webhook...');
console.log('URL:', url);
console.log('Payload:', JSON.stringify(payload, null, 2));
console.log('');

fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
})
  .then(response => {
    console.log('📡 Response Status:', response.status, response.statusText);
    return response.json();
  })
  .then(data => {
    console.log('📨 Response Body:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('');
      console.log('✅ SUCCESS: Email should be sent to:', data.email);
    } else {
      console.log('');
      console.log('❌ FAILED:', data.error || 'Unknown error');
    }
  })
  .catch(error => {
    console.error('');
    console.error('❌ Error:', error.message);
    console.error('');
    console.error('Possible issues:');
    console.error('1. Development server not running (run: npm run dev)');
    console.error('2. Wrong port (check if server is on port 3000)');
    console.error('3. Invalid payment ID');
  });
