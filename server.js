const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
const Admin = require('./models/admin')
const Cart = require('./models/cart')
const Offer = require('./models/offer')
const Order = require('./models/order')
const Product = require('./models/product')
const bcrypt = require('bcryptjs')
const EventOrder = require('./models/events')
const app = express()
const MONGO_URI = 'mongodb+srv://ismaildev58_db_user:jFjr5rCVfoi5N3td@cluster0.i6t3ptu.mongodb.net/bakeryDB?retryWrites=true&w=majority';
mongoose.set('strictQuery', false)

app.use(express.json({ limit: '10mb'}));
app.use(express.urlencoded({ limit: '10mb', extended: true}));
app.use(express.json())
app.use(cors())
app.use(express.static(path.join(__dirname, '../client')))
app.use(express.urlencoded({ extended: true}))


const connectDB = async () => {
    try{
        await mongoose.connect(MONGO_URI);
        console.log('Moongo connected Successfully');
    }
    catch(error){
        console.error('mongoDb connection Error:', error.message);
    }
}
connectDB();

// admin register routes
app.post('/api/register', async (req, res) => {
    try{
        const adminCount= await Admin.countDocuments();
        if (adminCount > 0) {
            return res.status(400).json({ message: 'Admin registration Closed. An admin account already exists.'})
        }

        const { name, email, password, regSecretPhrase} = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new Admin({
            name, email, password: hashedPassword, regSecretPhrase
        });
        await newAdmin.save();
        res.status(201).json({ message: 'Admin registered Successfully!'});
    }catch(e){
        res.status(500).json({ error: e.message})
    }
});

// admin login
app.post('/api/login', async(req, res) => {
    try{
        const {email, password} = req.body;

        if (!email || !password) {
            return res.status(404).json({ error: 'All Field are Required' });
        }
        const admin = await Admin.findOne({ email: email });

        if (!admin) {
            return res.status(404).json({ error: 'Invalid Email' });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);

        if (!isPasswordValid) {
            return res.status(404).json({ error: 'Invalid Email or Password' });
        }
        return res.status(200).json({ message: 'Login Successfully'})

    }catch(e){
        return res.status(500).json({ error: e.message })
    }
})

// Password reset-route
app.post('/api/reset-password', async(req, res) => {
    try{
        const { email, regSecretPhrase, newPassword} = req.body;
        console.log(req.body);
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ error: 'Admin Not Found'});
        }

        if (admin.regSecretPhrase !== regSecretPhrase) {
            return res.status(400).json({ error: 'Incorrect Secret Phrase'})
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)
        await Admin.findOneAndUpdate(
            { email: email},
            {$set: {password: hashedPassword}}
        );

        res.status(201).json({ message: 'Password reset successfully'})
    }catch(e){
        res.status(500).json({ message: 'unable to set password'})
    }
});

// Check if an admin already exists
app.get('/api/admin/check-exists', async(req, res) => {
    try{
        const adminCount = await Admin.countDocuments();
        return res.json({ adminExists: adminCount > 0 });
    }catch(e){
        res.status(500).json({error: e.message})
    }
})

app.post('/api/cart', async(req, res) => {
    try{
        const {productId} = req.body;
       if (!productId) {
            res.status(400).json({ error: "Product ID is required"})
       }
        // Check if item already exist in the cart

        let cartItem = await Cart.findOne({productId});

        if (cartItem) {
            cartItem.quantity += 1;
            await cartItem.save();
        }else{
            cartItem = new Cart({ productId })
            await cartItem.save()
        }

        res.json({ message: "Added to Cart", cartItem})
    }catch(error){
        res.status(500).json({ error: error.message})
    }
});

app.get('/api/cart', async(req, res) =>{
    try{
        const cartItems = await Cart.find().populate('productId');
        res.status(200).json(cartItems);
    }catch(error){
        res.status(500).json({ error: error.message})
    }
})
// Add a new product

app.post('/api/products', async(req, res) => {
    try{
        const { name, category, price, img, inStock} = req.body;
        const newProduct = new Product({
            name,
            category,
            price,
            img,
            inStock
        });
        await newProduct.save();
        res.status(201).json({ message: 'Product Created Succesfully'});
    }catch(err){
        res.status(400).json({ error: err.message})
    }
});
// Fetch all product
app.get('/api/products', async(req, res) => {
    try{
        const products = await Product.find();
        res.status(200).json(products);
    }catch(err){
        res.status(500).json({ error: err.message});
    }
});

// DELETE Product by ID
app.delete('/api/products/:id', async (req, res) => {
    try {
      const deletedProduct = await Product.findByIdAndDelete(req.params.id);
      if (!deletedProduct) {
        return res.status(404).json({ message: 'Product not found' });
      }
      res.json({ message: 'Product deleted successfully', id: req.params.id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

// Add a new offer (updated to capture full flash sale data)
app.post('/api/offers', async (req, res) => {
    try {
        const { 
            title, 
            description, 
            category, 
            image, 
            currentPrice, 
            oldPrice, 
            discountPercentage, 
            stockLeft, 
            totalStock, 
            active 
        } = req.body;


        // Calculate progress percentage
        const total = totalStock || 100;
        const left = stockLeft !== undefined ? stockLeft : total;
        const progressPercent = Math.round(((total - left) / total) * 100);

        const newOffer = new Offer({
            title,
            description,
            category,
            image,
            currentPrice,
            oldPrice,
            discountPercentage,
            stockLeft,
            totalStock,
            progressPercent,
            active
        });

        await newOffer.save();
        res.status(201).json({ message: 'Offer created successfully', newOffer });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//  fetch all offer

app.get('/api/offers', async(req, res) => {
    try{  
        const offer = await Offer.find();
        res.json(offer)
    }catch(e){
        res.status(500).json({error: e.message})
    }
});

// update stock and progres percentage
app.patch('/api/offers/:id/purchase', async(req, res) => {
    try{
        const offer = await Offer.findById(req.params.id);
        if(!offer) return res.status(404).json({ message: 'Offer Not Found '});

        // Decrease stock if available
        if (offer.stockLeft > 0) {
            offer.stockLeft -= 1;

            // recalculate progress percentage
            const total = offer.totalStock || 100;
            offer.progressPercent = Math.round(((total - offer.stockLeft) / total) * 100);
             await offer.save();
             return resjson({ message: 'Stock Updated Successfully', offer});
        }else{
            return res.status(400).json({ message: 'Item Out of Stock!' });
        }
    }catch(err){
        res.status(500).json({error: err.message})
    }
})

  // DELETE Offer by ID
app.delete('/api/offers/:id', async (req, res) => {
    try {
        const deletedOffer = await Offer.findByIdAndDelete(req.params.id);
        if (!deletedOffer) {
        return res.status(404).json({ message: 'Offer not found' });
        }
        res.json({ message: 'Offer deleted successfully', id: req.params.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// save a new order

app.post('/api/orders', async(req, res) => {
    try{
        const newOrder = new Order(req.body);
        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    }catch(e){
        res.status(500).json({ error: e.message});
    }
});

// get all orders
app.get('/api/orders', async(req, res) => {
    try{
        const orders = await Order.find().sort({ date: -1});
        res.json(orders);
    }catch(e){
        res.status(500).json({ error: e.message});
    }
});

// delete order
app.delete('/api/orders/:id', async(req, res) => {
    try{
        const deleteOrder = await Order.findByIdAndDelete(req.params.id);
        if (!deleteOrder) {
            return res.status(404).json({ message: 'Order Not Found'});
        }
        res.json({ message: 'Order Deleted Successfully'});
    }catch(e){
        res.status(500).json({ error: e.message});
    }
});

// update order status to fulfilled
app.patch('/api/orders/:id', async (req, res) => {
    try{
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { fulfillmentMethod: 'Fulfilled'},
            { new: true}
        );
        if(!updatedOrder){
         return res.status(404).json({ error: 'Order not found'})   
        }
        res.status(201).json(updatedOrder);
    }catch(e){
        res.status(500).json({ error: e.message})
    }
});

//create a new event pre-order table from the website
app.post('/api/event-orders', async(req, res) => {
    try{
        const newOrder = new EventOrder(req.body);
        await newOrder.save();
        return res.status(201).json({ message: 'Event Pre-order submitted Successfully!'});
    }catch(e){
        return res.status(500).json({ error: e.message})
    }
});

// get all event to display on the table
app.get('/api/event-orders', async(req, res) =>{
    try{
        const orders = await EventOrder.find().sort({ createAt: -1 });
        res.json(orders)
    }catch(e){
        return res.status(500).json({ error: e.message });
    }
});

// update Event Order status to fulfilled
app.patch('/api/event-orders/:id', async (req, res) => {
    try{
        const updatedEventOrder = await EventOrder.findByIdAndUpdate(
            req.params.id,
            { status: 'Fulfilled'},
            { new: true}
        );
        if(!updatedEventOrder){
         return res.status(404).json({ error: 'Event Order not found'})   
        }
        res.status(201).json(updatedEventOrder);
    }catch(e){
        res.status(500).json({ error: e.message})
    }
});

// delete event order

app.delete('/api/event-orders/:id', async(req, res) => {
    try{
        const deleteEventOrder = await EventOrder.findByIdAndDelete(req.params.id);
        if (!deleteEventOrder) {
            return res.status(404).json({ message: 'Order Not Found'});
        }
        res.json({ message: 'Event Order Deleted Successfully'});
    }catch(e){
        res.status(500).json({ error: e.message});
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {console.log(`Server running on Port ${PORT}`)});
