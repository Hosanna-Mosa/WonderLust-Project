const express = require('express');
const axios = require('axios');
const app = express();
const path = require("path");

app.set("view engine" , "ejs");
app.set("views",path.join(__dirname,"views"));

const LOCATIONIQ_API_KEY = 'pk.eb0706575225f618dc907f6eac46625e'; // Replace with your LocationIQ API key

app.get('/geocode', async (req, res) => {
  const location = "Visakhapatnam";
  try {
    const response = await axios.get(
      `https://us1.locationiq.com/v1/search.php?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(
        location
      )}&format=json`
    );
    const data = response.data;
    if (data.length > 0) {
      const coordinates = data[0];
      let lat = coordinates.lat;
      let lon = coordinates.lon

    
     res.render("index.ejs",{lat,lon});
     
    } 
  } catch (error) {
    res.status(500).json({ error: 'Geocoding failed' });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));


