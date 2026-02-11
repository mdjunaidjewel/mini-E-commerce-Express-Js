require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

/* ======================
   DATABASE CONNECTION
====================== */
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

/* ======================
   MODELS
====================== */

// User
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin","customer"], default: "customer" },
  cancelCount: { type: Number, default: 0 },
  blocked: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

// Product
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  description: String
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

// Order
const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, quantity: Number, price: Number }],
  totalAmount: Number,
  status: { type: String, enum: ["pending","shipped","delivered","cancelled"], default: "pending" }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

// Cart
const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: [{ product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, quantity: Number }]
}, { timestamps: true });

const Cart = mongoose.model("Cart", cartSchema);

/* ======================
   MIDDLEWARE
====================== */

// Protect routes
const protect = async (req,res,next)=>{
  try{
    const auth = req.headers.authorization;
    if(!auth || !auth.startsWith("Bearer")) return res.status(401).json({message:"Not authorized"});
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if(!user) return res.status(401).json({message:"User not found"});
    if(user.blocked) return res.status(403).json({message:"User blocked due to repeated cancellations"});
    req.user = decoded;
    next();
  }catch{
    res.status(401).json({message:"Invalid token"});
  }
};

// Admin only
const adminOnly = (req,res,next)=>{
  if(req.user.role!=="admin") return res.status(403).json({message:"Admin only"});
  next();
};

/* ======================
   AUTH ROUTES
====================== */

// Register
app.post("/api/register", async (req,res)=>{
  try{
    const {name,email,password} = req.body;
    if(!name || !email || !password) return res.status(400).json({message:"All fields required"});
    if(password.length<6) return res.status(400).json({message:"Password must be 6+ characters"});

    const existingUser = await User.findOne({email});
    if(existingUser) return res.status(400).json({message:"Email already exists"});

    const hashed = await bcrypt.hash(password,10);
    await User.create({name,email,password:hashed});
    res.status(201).json({message:"User registered"});
  }catch(err){
    res.status(500).json({message:"Server error"});
  }
});

// Login
app.post("/api/login", async(req,res)=>{
  try{
    const {email,password} = req.body;
    if(!email || !password) return res.status(400).json({message:"Email & password required"});
    const user = await User.findOne({email});
    if(!user) return res.status(400).json({message:"Invalid credentials"});
    const match = await bcrypt.compare(password,user.password);
    if(!match) return res.status(400).json({message:"Invalid credentials"});

    const token = jwt.sign({id:user._id,role:user.role},process.env.JWT_SECRET,{expiresIn:"1d"});
    res.json({token});
  }catch(err){
    res.status(500).json({message:"Server error"});
  }
});

/* ======================
   PRODUCT ROUTES
====================== */

// Create product
app.post("/api/products",protect,adminOnly, async(req,res)=>{
  try{
    const {name,price,stock} = req.body;
    if(!name || !price || !stock) return res.status(400).json({message:"Name, price & stock required"});
    const product = await Product.create(req.body);
    res.status(201).json(product);
  }catch(err){
    res.status(500).json({message:"Server error"});
  }
});

// Update product
app.put("/api/products/:id",protect,adminOnly, async(req,res)=>{
  try{
    const product = await Product.findByIdAndUpdate(req.params.id,req.body,{new:true});
    if(!product) return res.status(404).json({message:"Product not found"});
    res.json(product);
  }catch(err){
    res.status(500).json({message:"Server error"});
  }
});

// Delete product
app.delete("/api/products/:id",protect,adminOnly, async(req,res)=>{
  try{
    const product = await Product.findByIdAndDelete(req.params.id);
    if(!product) return res.status(404).json({message:"Product not found"});
    res.json({message:"Product deleted"});
  }catch(err){
    res.status(500).json({message:"Server error"});
  }
});

// List products
app.get("/api/products", async(req,res)=>{
  try{
    const products = await Product.find();
    res.json(products);
  }catch(err){
    res.status(500).json({message:"Server error"});
  }
});

/* ======================
   CART ROUTES
====================== */

// Add to cart
app.post("/api/cart",protect, async(req,res)=>{
  try{
    const {productId,quantity} = req.body;
    if(!productId || !quantity) return res.status(400).json({message:"Product and quantity required"});
    const product = await Product.findById(productId);
    if(!product) return res.status(404).json({message:"Product not found"});
    if(quantity>product.stock) return res.status(400).json({message:"Quantity exceeds stock"});
    let cart = await Cart.findOne({user:req.user.id});
    if(!cart){
      cart = await Cart.create({user:req.user.id,items:[{product:productId,quantity}]});
    }else{
      const exist = cart.items.find(i=>i.product.toString()===productId);
      if(exist) exist.quantity += quantity;
      else cart.items.push({product:productId,quantity});
      await cart.save();
    }
    res.json(cart);
  }catch{
    res.status(500).json({message:"Server error"});
  }
});

// Remove from cart
app.delete("/api/cart/:productId",protect, async(req,res)=>{
  try{
    const cart = await Cart.findOne({user:req.user.id});
    if(!cart) return res.status(404).json({message:"Cart not found"});
    cart.items = cart.items.filter(i=>i.product.toString()!==req.params.productId);
    await cart.save();
    res.json(cart);
  }catch{
    res.status(500).json({message:"Server error"});
  }
});

/* ======================
   ORDER ROUTES
====================== */

// Place order from cart
app.post("/api/orders/from-cart",protect, async(req,res)=>{
  const session = await mongoose.startSession();
  session.startTransaction();
  try{
    const cart = await Cart.findOne({user:req.user.id}).session(session);
    if(!cart || cart.items.length===0) throw new Error("Cart empty");
    let total=0;
    const orderItems=[];
    for(let item of cart.items){
      const product = await Product.findById(item.product).session(session);
      if(!product) throw new Error("Product not found");
      if(product.stock<item.quantity) throw new Error("Insufficient stock");
      total += product.price*item.quantity;
      product.stock -= item.quantity;
      await product.save({session});
      orderItems.push({product:product._id,quantity:item.quantity,price:product.price});
    }
    const order = await Order.create([{user:req.user.id,items:orderItems,totalAmount:total}],{session});
    await Cart.deleteOne({user:req.user.id}).session(session);
    await session.commitTransaction();
    session.endSession();
    res.status(201).json(order);
  }catch(err){
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({message:err.message});
  }
});

// Cancel order (fraud prevention)
app.post("/api/orders/:id/cancel",protect, async(req,res)=>{
  const session = await mongoose.startSession();
  session.startTransaction();
  try{
    const order = await Order.findById(req.params.id).session(session);
    if(!order) throw new Error("Order not found");
    if(order.user.toString()!==req.user.id && req.user.role!=="admin") throw new Error("Not authorized");
    if(order.status==="cancelled") throw new Error("Already cancelled");

    for(let item of order.items){
      const product = await Product.findById(item.product).session(session);
      if(product) product.stock += item.quantity;
      await product.save({session});
    }

    order.status="cancelled";
    await order.save({session});

    if(req.user.role==="customer"){
      const user = await User.findById(req.user.id).session(session);
      user.cancelCount +=1;
      if(user.cancelCount>=3) user.blocked=true;
      await user.save({session});
    }

    await session.commitTransaction();
    session.endSession();
    res.json({message:"Order cancelled"});
  }catch(err){
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({message:err.message});
  }
});

/* ======================
   SERVER START
====================== */
app.listen(process.env.PORT,()=>console.log(`Server running on port ${process.env.PORT}`));
