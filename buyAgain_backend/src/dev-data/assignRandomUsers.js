const fs = require('fs');

// The list of user IDs you provided
const userIds = [
  '68979127dc7122224fa5903d',
  '68979127dc7122224fa5903f',
  '68979127dc7122224fa59041',
  '68979127dc7122224fa59040',
  '68979127dc7122224fa59043',
  '68979127dc7122224fa59044',
  '68979127dc7122224fa5903e',
  '68979127dc7122224fa59042',
  '68979127dc7122224fa59045',
  '68979127dc7122224fa5903c',
  '68979127dc7122224fa59046',
];

// Function to read the product data from a file
const getProducts = () => {
  // Assuming your product JSON is in a file named `products.json`
  try {
    const data = fs.readFileSync(`${__dirname}/product-data.json`, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading or parsing products.json:', error);
    process.exit(1);
  }
};

// Function to assign random user IDs to reviews
const assignRandomUsers = (products, userIds) => {
  const assignUsers = (reviews) => {
    if (!reviews || !Array.isArray(reviews)) return;

    reviews.forEach((review) => {
      const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
      review.user = randomUserId;
    });
  };

  products.forEach((product) => {
    // Check if the reviews property is a nested array
    if (product.reviews && Array.isArray(product.reviews[0])) {
      // If it's a nested array, loop through the inner array
      product.reviews.forEach((reviewArray) => assignUsers(reviewArray));
    } else {
      // Otherwise, assume it's a simple array of review objects
      assignUsers(product.reviews);
    }
  });

  return products;
};

// Main function to run the script
const run = () => {
  const products = getProducts();
  console.log('Original product data loaded.');

  const updatedProducts = assignRandomUsers(products, userIds);
  console.log('Random user IDs assigned to reviews.');

  // Write the updated data to a new file
  const outputFileName = `${__dirname}/updated-product-data.json`;
  fs.writeFileSync(
    outputFileName,
    JSON.stringify(updatedProducts, null, 2),
    'utf-8',
  );
  console.log(`Updated data written to ${outputFileName}`);
};

run();

// exec the script:
// node ./src/dev-data/assignRandomUsers.js
