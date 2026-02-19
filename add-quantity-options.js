// Script to add quantity options to existing product
// Run this script to update the Apple Cider Vinegar product

const productId = "699572e122b312db146293f2"; // Your product ID

const quantityOptions = [
  {
    id: "opt1",
    quantity: 500,
    unit: "ml",
    packSize: 1,
    displayLabel: "500ml",
    price: 1,
    originalPrice: 2,
    stock: 10,
    isActive: true,
    sortOrder: 0
  },
  {
    id: "opt2", 
    quantity: 1000,
    unit: "ml",
    packSize: 2,
    displayLabel: "1L (2 X 500ml)",
    price: 3,
    originalPrice: 4,
    stock: 5,
    isActive: true,
    sortOrder: 1
  },
  {
    id: "opt3",
    quantity: 1500,
    unit: "ml", 
    packSize: 3,
    displayLabel: "1.5L (3 X 500ml)",
    price: 5,
    originalPrice: 6,
    stock: 3,
    isActive: true,
    sortOrder: 2
  }
];

// MongoDB update query
const updateQuery = {
  _id: productId,
  $set: {
    quantityOptions: quantityOptions,
    // Disable legacy size tracking
    trackInventoryBySize: false,
    sizes: [],
    sizeInventory: []
  }
};

console.log('Updating product with quantity options:', updateQuery);

// You can run this in MongoDB shell or use it in your backend API
console.log('Copy this query to update your product:');
console.log(JSON.stringify(updateQuery, null, 2));
