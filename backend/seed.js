const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Place = require('./models/Place');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

// A huge list of neighborhoods in Bangalore
const neighborhoods = [
  { name: "Indiranagar", lat: 12.9784, lng: 77.6408 },
  { name: "Koramangala", lat: 12.9279, lng: 77.6271 },
  { name: "Whitefield", lat: 12.9698, lng: 77.7499 },
  { name: "Jayanagar", lat: 12.9299, lng: 77.5826 },
  { name: "JP Nagar", lat: 12.9063, lng: 77.5857 },
  { name: "Malleshwaram", lat: 13.0031, lng: 77.5643 },
  { name: "HSR Layout", lat: 12.9121, lng: 77.6446 },
  { name: "Bellandur", lat: 12.9304, lng: 77.6784 },
  { name: "Electronic City", lat: 12.8452, lng: 77.6602 },
  { name: "Marathahalli", lat: 12.9569, lng: 77.7011 },
  { name: "MG Road", lat: 12.9719, lng: 77.6010 },
  { name: "Basavanagudi", lat: 12.9406, lng: 77.5738 },
  { name: "BTM Layout", lat: 12.9166, lng: 77.6101 },
  { name: "Banashankari", lat: 12.9255, lng: 77.5468 },
  { name: "Yelahanka", lat: 13.1007, lng: 77.5963 },
  { name: "Hebbal", lat: 13.0354, lng: 77.5988 },
  { name: "Domlur", lat: 12.9609, lng: 77.6387 },
  { name: "Malleswaram", lat: 13.0031, lng: 77.5643 },
  { name: "Rajajinagar", lat: 12.9981, lng: 77.5504 },
  { name: "Richmond Town", lat: 12.9642, lng: 77.5981 },
  { name: "Frazer Town", lat: 12.9959, lng: 77.6148 },
  { name: "Kalyan Nagar", lat: 13.0280, lng: 77.6399 },
  { name: "Kammanahalli", lat: 13.0159, lng: 77.6380 },
  { name: "Sarjapur Road", lat: 12.9244, lng: 77.6503 },
  { name: "CV Raman Nagar", lat: 12.9863, lng: 77.6631 },
  { name: "Banaswadi", lat: 13.0141, lng: 77.6518 },
  { name: "Brookefield", lat: 12.9647, lng: 77.7176 },
  { name: "Koramangala 1st Block", lat: 12.9262, lng: 77.6331 },
  { name: "Koramangala 5th Block", lat: 12.9348, lng: 77.6210 },
  { name: "Vasanth Nagar", lat: 12.9896, lng: 77.5928 },
  { name: "Sadashivanagar", lat: 13.0068, lng: 77.5813 },
  { name: "RT Nagar", lat: 13.0247, lng: 77.5948 },
  { name: "Sanjay Nagar", lat: 13.0355, lng: 77.5772 },
  { name: "HBR Layout", lat: 13.0294, lng: 77.6300 },
  { name: "Sahakar Nagar", lat: 13.0645, lng: 77.5920 },
  { name: "Nagarbhavi", lat: 12.9546, lng: 77.5111 },
  { name: "Vijayanagar", lat: 12.9756, lng: 77.5354 },
  { name: "Kengeri", lat: 12.9176, lng: 77.4822 },
  { name: "Yeshwanthpur", lat: 13.0285, lng: 77.5409 },
  { name: "Peenya", lat: 13.0285, lng: 77.5197 }
];

// Diverse image pools for each category
const images = {
  Restaurant: [
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1466978913421-bac2e5e7514a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1525610553991-2bede1a236e2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80"
  ],
  Cafe: [
    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1445116572660-236099cecd07?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1525648199074-cee30ba79a4a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80"
  ],
  Hotel: [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1542314831-c6a420325142?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1551882547-ff40c0d12c5b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80"
  ],
  Bar: [
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1575037614876-c385aa6db5d2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1583002621118-208151cb82eb?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1470337458703-415120a41f67?auto=format&fit=crop&w=800&q=80"
  ],
  Nightlife: [
    "https://images.unsplash.com/photo-1538488881038-e252a119ace7?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1571262596328-cd29bb467554?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80"
  ],
  "Tech Park": [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=800&q=80"
  ],
  Mall: [
    "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1536640712-4d4c36ef0e4c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1567608198472-6796ad9466a2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1555529771-835f59fc5efe?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1620015707770-07e0ea9bb9a5?auto=format&fit=crop&w=800&q=80"
  ],
  "Tourist Spot": [
    "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1620766182966-c6eb5ed2b788?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1598257006626-48b0c252070d?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80"
  ]
};

const categoriesData = [
  { cat: "Restaurant", prefixes: ["The Grand", "Spice of", "Royal", "Authentic", "Urban", "Golden", "Signature", "Classic", "Vintage", "Modern"], suffixes: ["Diner", "Kitchen", "Bistro", "Eatery", "House", "Cuisine", "Grill", "Tavern", "Dining", "Express"] },
  { cat: "Cafe", prefixes: ["Brewed", "Roasters of", "The Cozy", "Daily", "Artisan", "Mug &", "Morning", "Velvet", "Roasted", "Steaming"], suffixes: ["Cafe", "Coffee House", "Bakes & Brews", "Lounge", "Beanery", "Roastery", "Bistro", "Cup", "Espresso", "Sips"] },
  { cat: "Hotel", prefixes: ["Taj", "ITC", "The Residency", "Grand", "Premium", "Elite", "Royal", "Oasis", "Luxe", "City"], suffixes: ["Hotel", "Suites", "Inn", "Resort", "Stay", "Lodge", "Retreat", "Palace", "Plaza", "Boutique"] },
  { cat: "Bar", prefixes: ["The Drunken", "High", "Local", "Tipsy", "Neon", "Midnight", "Copper", "Rusty", "Velvet", "Urban"], suffixes: ["Bar", "Pub", "Tavern", "Lounge", "Taproom", "Saloon", "Mixology", "Spirits", "Drafts", "Cellar"] },
  { cat: "Nightlife", prefixes: ["Club", "Sky", "Vibe", "Rhythm", "Electric", "Neon", "Pulse", "Sonic", "Eclipse", "Zenith"], suffixes: ["Nightclub", "Brewpub", "Social", "Lounge", "Arena", "Beats", "Groove", "Space", "Loft", "Underground"] },
  { cat: "Tech Park", prefixes: ["Embassy", "RMZ", "Brigade", "Prestige", "Global", "Infinity", "Cyber", "Nexus", "Vanguard", "Summit"], suffixes: ["Tech Park", "Business Park", "IT SEZ", "Campus", "Towers", "Hub", "Center", "Valley", "Plaza", "Heights"] },
  { cat: "Mall", prefixes: ["Forum", "Orion", "Phoenix", "Garuda", "Central", "Oasis", "Nexus", "Galaxy", "Crown", "Pinnacle"], suffixes: ["Mall", "Marketcity", "Plaza", "Square", "Center", "Galleria", "Avenue", "Walk", "Arcade", "Boulevard"] },
  { cat: "Tourist Spot", prefixes: ["Historic", "Royal", "Heritage", "Green", "Iconic", "Ancient", "Sacred", "Majestic", "Tranquil", "Scenic"], suffixes: ["Gardens", "Palace", "Museum", "Monument", "Park", "Fort", "Lake", "Sanctuary", "Ruins", "Square"] }
];

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomOffset = () => (Math.random() - 0.5) * 0.05; // Larger spread for more variety across neighborhoods

const generatedPlaces = [];

// To hit ~450 places across 40 neighborhoods:
// 40 neighborhoods * 8 categories * 1-2 places per category = roughly 450-500 places.

neighborhoods.forEach(hood => {
  categoriesData.forEach(catData => {
    // Generate 1 to 2 places per category in this neighborhood
    const count = Math.floor(Math.random() * 2) + 1; 
    for(let i=0; i<count; i++) {
      const prefix = getRandomElement(catData.prefixes);
      const suffix = getRandomElement(catData.suffixes);
      const img = getRandomElement(images[catData.cat]);
      
      generatedPlaces.push({
        name: `${prefix} ${hood.name} ${suffix}`,
        description: `Experience the best ${catData.cat.toLowerCase()} located in the vibrant area of ${hood.name}. Outstanding reviews and top-notch ambiance making it a must-visit destination in Bangalore.`,
        category: catData.cat,
        location: { 
          lat: hood.lat + getRandomOffset(), 
          lng: hood.lng + getRandomOffset() 
        },
        rating: Number((Math.random() * 1.5 + 3.5).toFixed(1)), // Between 3.5 and 5.0
        reviewsCount: Math.floor(Math.random() * 2000) + 50, // Between 50 and 2050
        images: [img]
      });
    }
  });
});

const seedDB = async () => {
  try {
    await Place.deleteMany();
    console.log('Places deleted');
    await Place.insertMany(generatedPlaces);
    console.log(`Successfully seeded ${generatedPlaces.length} places with uniquely distributed diverse photos in Bangalore!`);
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seedDB();
