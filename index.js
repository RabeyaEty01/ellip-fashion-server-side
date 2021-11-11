const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
const app = express();

const port = process.env.PORT || 5000;

//midleware
app.use(cors());
app.use(express.json());

//database uri
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ssjib.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

//console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        console.log('connected to the database');
        const database = client.db("EllipFashion");
        const productsCollection = database.collection("products");
        const reviewCollection = database.collection("reviews");
        const ordersCollection = database.collection("orders");
        const usersCollection = database.collection("users");


        //GET ALL Products
        app.get('/products', async (req, res) => {
            const result = await productsCollection.find({}).toArray();
            res.send(result);
        });

        //GET ALL Reviews
        app.get('/reviews', async (req, res) => {
            const result = await reviewCollection.find({}).toArray();
            res.send(result);
        });



        //GET Single Product
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            console.log('load single product with id', id);
            res.send(product);
        });

        //GET My Orders
        app.get('/myOrders/:email', async (req, res) => {
            const result = await ordersCollection.find({ email: req.params.email }).toArray();
            res.send(result);
        })

        //Place Order 
        app.post('/placeOrder', (req, res) => {
            console.log(req.body);
            ordersCollection.insertOne(req.body).then(result => {
                res.send(result);
            });
        })

        //GET All Orders
        app.get('/orders', async (req, res) => {
            const result = await ordersCollection.find({}).toArray();
            res.send(result);
        });

           //GET admin
           app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });



        //POST Product API
        app.post('/addProducts', async (req, res) => {
            const product = req.body;
            console.log('hit the api', product);
            const result = await productsCollection.insertOne(product);
            console.log(result);
            res.json(result);
        });

        //POST Review API
        app.post('/addReview', async (req, res) => {
            const review = req.body;
            console.log('hit the api', review);
            const result = await reviewCollection.insertOne(review);
            console.log(result);
            res.json(result);
        });




        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });

        //PUT new user info to the server side
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });


         //PUT Admin role and verify admin
         app.put('/users/admin', async (req, res) => {
            const user = req.body;
            // const requester = req.email;
            console.log(user);
           
              
               
                    const filter = { email: user.email };
                    const updateDoc = {
                        $set:
                            { role: 'admin' }
                    };
                    const result = await usersCollection.updateOne(filter, updateDoc);
                    res.json(result);

                
            
           



         });

           //DELETE Order
           app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            console.log(result);

             console.log('deleteing user with id', id);

            res.json(result);
        });

    }
    finally {
        //await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Travio Tour Guide Server is Running');
});

app.listen(port, () => {
    console.log('Server is running on port', port);
});