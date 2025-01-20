const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const express = require('express');
const cloudinary = require('cloudinary').v2;
const app = express();

const MONGO_URL = process.env.ATLASDB_URL;

main().then(() =>{
    console.log("The DataBase Connected Successfully!!");
}).catch(err => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}




app.get('/upload', async (req, res) => {
  try {
    const updatedData = await Promise.all(
      initData.data.map(async (item, index) => {
        console.log(`Processing item ${index + 1}:`, item);

        try {
          // Upload the image to Cloudinary
          const result = await cloudinary.uploader.upload(item.image.url, {
            folder: 'WonderLust',
          });

          console.log(`Cloudinary upload success for item ${index + 1}:`, result);

          // Construct the updated item
          return {
            title: item.title || "Default Title",
            description: item.description || "Default Description",
            image: {
              url: result.secure_url,
              filename: result.public_id,
            },
            price: item.price || 0,
            location: item.location || "Default Location",
            country: item.country || "Default Country",
            reviews: item.reviews || [],
            owner: '677e55df82430ffca7a7065b', // Ensure this is a valid ObjectId
          };
        } catch (error) {
          console.error(`Error uploading image for item ${index + 1}:`, error);
          throw error; // Ensure errors propagate
        }
      })
    );

    console.log("Final updated data:", updatedData);

    // Insert the updated data into MongoDB
    const insertResult = await Listing.insertMany(updatedData);
    console.log("Insert result:", insertResult);

    res.status(200).send("Images uploaded and data inserted successfully!");
  } catch (error) {
    console.error("Error during upload and insertion:", error);
    res.status(500).json({ error: "Failed to initialize data", details: error });
  }
});


// Start the server
const PORT = 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



// const initDB = async () => {
//   await Listing.deleteMany({});
//   console.log('Data Deleted');
//   let smple = initData.data.map(id => console.log(id.image.filename , id.image.url , id.title ));
  

  
//   // initData.data.map(id => id.owner = '677e55df82430ffca7a7065b');
//   // await Listing.insertMany(initData.data);
//   // console.log("data was initialized");
// };

// initDB();