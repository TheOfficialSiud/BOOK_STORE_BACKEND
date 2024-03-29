

const express = require('express')
const app = express()
const cors = require('cors')

const dotenv = require('dotenv');
dotenv.config();
const port = process.env.PORT || 5000

//middleware
app.use(cors());
app.use(express.json()); //req.body  

app.get('/', (req, res) => {
  res.send('Hello World!')
})

//mongoDB connection

const username= process.env.USERNAME;
const password= process.env.PASSWORD;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://mer-book-store:${password}@cluster0.dihdk56.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    //create a collection of documents
    const bookCollection = client.db("BookInventory").collection("books");

    //insert a book to the database: post method
    app.post("/upload-book", async (req, res) => {
        const data=req.body;
        const result=await bookCollection.insertOne(data);
        res.send(result);

    })

    //get all books from the database: get method
    app.get("/all-books", async (req, res) =>{
        const books=await bookCollection.find();
        const result=await books.toArray();
        res.send(result);
    } )

    //update a book from the database: patch or update method
    app.patch("/book/:id", async (req, res) =>{
        const id=req.params.id;
        // console.log(id);
        const updateBookData=req.body;
        const filter={_id: new ObjectId(id)};
        const options={upsert: true};

        const updateDoc={
            $set:{
                ...updateBookData,
            }
        }

        //update
        const result=await bookCollection.updateOne(filter, updateDoc, options);
        res.send(result);
    })

    //delete a book from the database
    app.delete("/book/:id", async (req, res) =>{
        const id=req.params.id;
        // console.log(id);
        const filter={_id: new ObjectId(id)};
        const result=await bookCollection.deleteOne(filter);
        res.send(result);
    })

    //find by category
    app.get("/all-books/:category", async (req, res) =>{
        let query={};
        if(req.query?.category){
            query={category: req.query.category}
        }
        const result=await bookCollection.find(query).toArray();
        res.send(result);
    })

    //to get single book
    app.get("/book/:id", async (req, res) =>{
      // console.log(req.params);
        const id=req.params.id;
        // console.log(id);
        const filter={_id: new ObjectId(id)};
        const result=await bookCollection.findOne(filter);
        res.send(result);
    })

    // app.get('/book/:id', async (req, res) => {
    //   try {
    //     const bookId = req.params.id;
    //     // Your asynchronous operations here
    //     const bookData = await fetchBookData(bookId);
    //     res.json(bookData);
    //   } catch (error) {
    //     console.error('Error handling /book/:id route:', error);
    //     res.status(500).json({ error: 'Internal Server Error' });
    //   }
    // });


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

