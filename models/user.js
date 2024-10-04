const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  userName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  post: {
    type: String,
    default: "visitor",
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
  likedProducts: {
    type: [Schema.Types.ObjectId],
    ref: "Product",
  },

  models: {
    type: [
      {
        modelName: { type: String, required: true },
        imageUrl: { type: String, required: true },
        modelUrl: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        status: { type: String, default: "pending" },
      },
    ],
  },
});

userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity,
    });
  }
  const updatedCart = {
    items: updatedCartItems,
  };
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.removeFromCart = function (prodId) {
  const upList = [];
  console.log("PRODID: " + prodId);
  for (let i = 0; i < this.cart.items.length; i++) {
    if (String(this.cart.items[i].productId) !== prodId) {
      console.log(String(this.cart.items[i].productId));
      console.log(prodId);
      upList.push(this.cart.items[i]);
    }
  }
  this.cart.items = upList;
  return this.save();
};

userSchema.methods.removeOneFromCart = function (prodId) {
  const upList = [];
  for (let i = 0; i < this.cart.items.length; i++) {
    if (String(this.cart.items[i].productId) !== prodId) {
      upList.push(this.cart.items[i]);
    } else {
      if (this.cart.items[i].quantity > 1) {
        upList.push({
          productId: this.cart.items[i].productId,
          quantity: this.cart.items[i].quantity - 1,
        });
      }
    }
  }
  this.cart.items = upList;
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
};

module.exports = mongoose.model("User", userSchema);
