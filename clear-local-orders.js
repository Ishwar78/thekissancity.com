// Clear all local order data from localStorage
console.log('🧹 Clearing local orders...');

try {
  localStorage.removeItem('uni_orders_v1');
  localStorage.removeItem('uni_last_order_id');
  console.log('✅ Local orders cleared successfully');
} catch (error) {
  console.error('❌ Error clearing local orders:', error);
}

// Reload the page to apply changes
setTimeout(() => {
  location.reload();
}, 1000);
