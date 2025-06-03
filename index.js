const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
app.use(cors());
require("dotenv").config(); 
app.use(express.urlencoded({ limit: '200mb', extended: true }));
app.use(express.json({ limit: '200mb' }));

const PORT = process.env.PORT;


// Routes
const mailRoutes = require('./routes/mailRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const albumRoutes = require('./routes/albumRoutes.js');
const imageRoutes = require('./routes/imageRoutes.js');
const storeRoutes = require('./routes/storeRoutes.js');
const orderRoutes = require('./routes/checkoutRoutes.js');

app.use('/mail', mailRoutes);
app.use('/albums', albumRoutes);
app.use('/images', imageRoutes);
app.use('/user', userRoutes);
app.use('/store', storeRoutes);
app.use('/checkout', orderRoutes);


// Connect to MongoDB
mongoose.connect(process.env.MONGO_CONNECTION_STRING)
	.then(() => {
		app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
});
		
})
	.catch(err => console.log(err));
