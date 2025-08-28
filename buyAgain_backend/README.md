# API Server Documentation

Welcome to buyAgain's API server documentation. This server provides endpoints for managing authentication, users, products, reviews, orders and shopping cart functionalities. The API follows RESTful principles and includes protections and role-based restrictions.

---

## Base URL

All endpoints are prefixed with `/api/v1`.

---

## Authentication (`/api/v1/auth`)

Handles user authentication, registration, password management, and token refresh.

### Endpoints

- **POST `/signup`**
  Register a new user. Role assignment is handled by middleware.

- **POST `/login`**
  Authenticate user and receive access tokens.

- **POST `/forgotPassword`**
  Initiate password reset process.

- **PATCH `/resetPassword/:token`**
  Reset password using token.

- **POST `/refreshToken`**
  Refresh authentication tokens.

- **POST `/logout`** _(protected)_
  Log out current user.

- **PATCH `/updatePassword`** _(protected)_
  Update logged-in user's password.

- **PATCH `/:id/updateRole`** _(admin only)_
  Delegate role to user.

---

## Users (`/api/v1/users`)

Manage user data.

### Endpoints

- **GET `/`** _(admin only)_
  Retrieve all users.

- **GET `/me`**
  Get current user's profile.

- **PATCH `/me`**
  Update current user's profile, including uploading and resizing profile photos.

- **GET `/:id`** _(admin only)_
  Retrieve specific user by ID.

- **PATCH `/:id`** _(admin only)_
  Update user info and roles.

---

## Products (`/api/v1/products`)

Manage product catalog and images.

### Endpoints

- **GET `/`**
  Get all products.

- **GET `/:id`**
  Get product details.

- **POST `/addProduct`** _(seller & admin only)_
  Add new product.

- **PUT `/updateProduct/:id`**
  Update product details and images.

- **PATCH `/updateProduct/:id`**
  Partial update for product.

- **DELETE `/:id`**
  Remove a product.

### Nested Routes

- **Reviews** for products are accessible via `/api/v1/products/:productId/reviews`.

---

## Reviews (`/api/v1/reviews`)

Manage product reviews.

### Endpoints

- **GET `/`**
  Get all reviews.

- **POST `/`** _(authenticated users)_
  Create a review for a product.

- **GET `/:id`**
  Get specific review.

- **PUT/PATCH `/:id`** _(review owner)_
  Update review.

- **DELETE `/:id`** _(review owner)_
  Delete review.

---

## Orders (`/api/v1/orders`)

Handle order creation, checkout, and management.

### Endpoints

- **GET `/success`**
  Handle successful order processing.

- **GET `/session/:sessionId`**
  Retrieve order by payment session ID.

- **GET `/my-orders`**
  Get current user's orders.

- **GET `/my-orders/:orderId`**
  Get details of a specific order.

- **POST `/checkout`**
  Initiate checkout session.

- **GET `/`** _(admin only)_
  Get all orders.

- **PATCH `/:orderId`** _(admin & seller)_
  Update order status.

- **GET `/:orderId/receipt`**
  Download receipt PDF.

---

## Shopping Cart (`/api/v1/cart`)

Manage user's shopping cart.

### Endpoints

- **GET `/`**
  Get current user's cart.

- **POST `/`**
  Add item to cart.

- **DELETE `/`**
  Clear cart.

- **PATCH `/:itemId`**
  Update item quantity.

- **DELETE `/:itemId`**
  Remove item from cart.

- **POST `/merge`**
  Merge guest cart with user cart.

---

## Middleware & Security

- Routes are protected with `authController.protectRoute`.
- Role restrictions enforced with `authController.restrictTo`.
- Certain actions (like product creation or user management) are restricted to roles like `'admin'`, `'seller'`, or `'user'`.
- Image uploads and resizing are handled via dedicated controllers.
- Images are saved using Cloudinary(CDN) to get the urls

---

## Notes

- Include authentication tokens in the `Authorization` header as `Bearer <token>` for protected routes.

---

## Running the API Server Locally

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20.x or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- TypeScript globally installed (optional but recommended)

```bash
npm install -g typescript
```

### Setup Instructions

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Create a `.env` file in the root directory.
   - Set necessary variables (e.g., database connection string, secret keys):
     ```
     DATABASE_URL=your_database_connection_string
     SECRET_KEY=your_secret_key
     PORT=3000
     ```

4. **Compile TypeScript to JavaScript**

- Run the TypeScript compiler:
  `tsc`

- This generates compiled JavaScript files in the dist or build folder (depending on your tsconfig.json configuration).

5. Run the server

- If you have a start script in package.json, such as:

```
"scripts": {
  "start": "node dist/server.js",
  "dev": "ts-node-dev --respawn --transpile-only src/server.ts"
}
```

- Use:

```
npm run start
```

- or for development with hot reload:

```
npm run dev
```

- Alternatively, you can run directly with ts-node (if installed):

```
## npx ts-node src/server.ts
```

### Development Tips

- Use ts-node-dev for automatic restart on code changes:

```
npm install -D ts-node-dev
npm run dev
```

- Make sure your tsconfig.json is properly configured to compile to the correct directory.

---

### Additional Tips

- Use tools like Postman or Insomnia to test the API endpoints.
- For development, you can use `nodemon` for automatic restarts:
  ```bash
  npm install -D nodemon
  npm run dev
  ```

(Ensure your `package.json` has a script like `"dev": "nodemon server.js"`)
