const express = require('express');
const mongoose = require('mongoose');
const moment = require('moment');
const { User, Flight } = require('./models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors')

require('dotenv').config();
const app = express();
const axios = require('axios');
const authenticateToken = require('./jwtMiddleware'); // Import the middleware
const { where } = require('./models/user.model');


/*
// app.js
const { User } = require('./models');

async function createUser() {
  const newUser = new User({
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'securepassword',
  });
  
  await newUser.save();
  console.log('User saved:', newUser);
}

createUser();

*/
//mongodb+srv://mustafagantep27:<db_password>@cluster0.wql50r4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
app.use(cors());
const port = 6382;
app.use(bodyParser.json());
const JWT_SECRET = process.env.JWT_SECRET;

mongoose.connect(`mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@cluster0.nznq0nt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`)
.then(res => console.log("res")).catch(err => console.error(err));


app.get('/', (req, res) => {
    res.send("TADAN");
})

app.post('/register', async (req, res) => {
    try {
      const { name, email, password } = req.body;
  
      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Create a new user
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
      });
  
      await newUser.save();
  
      // Create JWT token after successful registration
      const token = jwt.sign({ userId: newUser._id, email: newUser.email }, JWT_SECRET, { expiresIn: '1h' });
  
      res.status(201).json({ message: 'User registered successfully', token });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Login route
app.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }
  
      const userId = user._id;
      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json('Invalid email or password');
      }
  
      // Create JWT token upon successful login (jwt token expires in 3 hours)
      const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '3h' });
  
      res.status(200).json({ message: 'Login successful', token, userId });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });


app.get('/listflights', authenticateToken, async (req, res) => {
/*
  # QUERY PARAMS #
  scheduleDate	
  scheduleTime
  flightName
  flightDirection
  airline
  airlineCode
  route,
  includedelays,
  page,
  sort,
*///flightName
  const { scheduleDate, scheduleTime, flightName, flightDirection, airline, airlineCode, route, includedelays, page, sort, fromDateTime, toDateTime, searchDateTimeField, fromScheduleDate, toScheduleDate,  isOperationalFlight} = req.query;
  console.log(scheduleDate, scheduleTime, flightName, flightDirection, airline, airlineCode, route, includedelays, page, sort, fromDateTime, toDateTime, searchDateTimeField, fromScheduleDate, toScheduleDate,  isOperationalFlight);
  
  await axios.get(`https://api.schiphol.nl/public-flights/flights`, {
      headers:{
        'resourceversion': 'v4',
        'app_id': process.env.APP_ID,
        'app_key': process.env.APP_KEY
      },
      params:{
        scheduleDate, scheduleTime, flightName, flightDirection, airline, airlineCode, route, includedelays, page, sort, fromDateTime, toDateTime, searchDateTimeField, fromScheduleDate, toScheduleDate,  isOperationalFlight}
    })
    .then(response => res.send(response.data.flights))
    .catch(err => {res.status(500).send(err.message); console.log(err)});

    });

app.get('/getspecificflight/:id', authenticateToken, async (req, res) => {
  const flightId = req.params.id; // Extract the 'id' parameter from the URL

  try {
    await axios.get(`https://api.schiphol.nl/public-flights/flights/${flightId}`, {
      headers:{
        'resourceversion': 'v4',
        'app_id': process.env.APP_ID,
        'app_key': process.env.APP_KEY
      }
    })
    .then(response => res.status(200).send(response.data))
    .catch(err => res.status(500).send(err.message));
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving flight', error: err.message });
  }
});

app.get('/fetchairlines', authenticateToken, (req, res) => {
  axios.get(`https://api.schiphol.nl/public-flights/airlines`, {
    headers:{
      'resourceversion': 'v4',
      'app_id': process.env.APP_ID,
      'app_key': process.env.APP_KEY
    }
  })
  .then(response => res.status(200).send(response.data))
  .catch(err => res.status(500).send(err.message));
});


app.get(`/chooseairline/:airline`, (req, res) => {
  const  airline  = req.params.airline;
  axios.get(`https://api.schiphol.nl/public-flights/airlines/${airline}`, {
    headers:{
      'resourceversion': 'v4',
      'app_id': process.env.APP_ID,
      'app_key': process.env.APP_KEY
    }
  })
  .then(response => {
    console.log(response.data);
    res.status(200).send(response.data)})
  .catch(err => {
    console.log(err);
    res.status(500).send(err.message);
  });

});


app.get(`/destinations/:iata`, (req, res) => {
  const  iata  = req.params.iata;
  axios.get(`https://api.schiphol.nl/public-flights/destinations/${iata}`, {
    headers:{
      'resourceversion': 'v4',
      'app_id': process.env.APP_ID,
      'app_key': process.env.APP_KEY
    }
  })
  .then(response => {
    console.log(response.data);
    res.status(200).send(response.data)})
  .catch(err => {
    console.log(err);
    res.status(500).send(err.message);
  });

});

app.post('/pickflight', authenticateToken, async (req, res) => {
  const { userId, flightId, price } = req.body;

  try {
    const user = await User.findById(userId); // Find user by ID
    if (!user) {
      return res.status(404).json({ message: 'User or flight not found, so that you must not proceed without these informations.' }); // If no user, return 404
    }

    await axios.get(`https://api.schiphol.nl/public-flights/flights/${flightId}`, {
      headers:{
        'resourceversion': 'v4',
        'app_id': process.env.APP_ID,
        'app_key': process.env.APP_KEY
      }
    })
    .then(async (response) => {

        if(moment(response.data.scheduleDateTime) < moment()){
          return res.status(405).send("Flight datetime is before than now!");
        }
        // Ensure correct reference to the field 'aircraftType' (not 'airCraftType')
        const flight = new Flight({
          userId: userId,
          lastUpdatedAt: response.data.lastUpdatedAt || "",
          actualLandingTime: response.data.actualLandingTime || "",
          actualOffBlockTime: response.data.actualOffBlockTime || "",
          aircraftRegistration: response.data.aircraftRegistration || "",
          aircraftType: {
            iataMain: response.data.aircraftType?.iataMain || "",  // Corrected 'aircraftType'
            iataSub: response.data.aircraftType?.iataSub || ""
          },
          baggageClaim: {
            belts: response.data.baggageClaim?.belts || []
          },
          checkinAllocations:{
              checkinAllocations: response.data.checkinAllocations?.checkinAllocations || [],
              remarks: response.data.checkinAllocations?.remarks || [],
          },
          codeshares: {
              codeshares: response.data.codeshares?.codeshares || ""
          },
          estimatedLandingTime: response.data.estimatedLandingTime || "",
          expectedTimeBoarding: response.data.expectedTimeBoarding || "",
          expectedTimeGateClosing: response.data.expectedTimeGateClosing || "",
          expectedTimeGateOpen: response.data.expectedTimeGateOpen || "",
          expectedTimeOnBelt: response.data.expectedTimeOnBelt || "",
          expectedSecurityFilter: response.data.expectedSecurityFilter || "",
          flightDirection: response.data.flightDirection || "",
          flightName: response.data.flightName || "",
          flightNumber: response.data.flightNumber || "",
          gate: response.data.gate || "",
          pier: response.data.pier || "",
          id: response.data.id || "",
          isOperationalFlight: response.data.isOperationalFlight || false,
          mainFlight: response.data.mainFlight || "",
          prefixIATA: response.data.prefixIATA || "",
          prefixICAO: response.data.prefixICAO || "",
          airlineCode: response.data.airlineCode || 0,
          publicEstimatedOffBlockTime: response.data.publicEstimatedOffBlockTime || "",
          publicFlightState: {
              flightStates: response.data.publicFlightState?.flightStates || []
          },
          route:{
              destinations: response.data.route?.destinations || [],
              eu: response.data.route?.eu || "",
              visa: response.data.route?.visa || false 
          },
          scheduleDateTime: response.data.scheduleDateTime || "",
          scheduleDate: response.data.scheduleDate || "",
          scheduleTime: response.data.scheduleTime || "",
          serviceType: response.data.serviceType || "",
          terminal: response.data.terminal || 0,
          transferPositions:{
              transferPositions: response.data.transferPositions?.transferPositions || [],
          },
          schemaVersion: response.data.schemaVersion || "",
          price: price
        })

        await flight.save();

        res.status(201).json({ message: 'Flight picked and saved successfully', flight: flight });

    })
    .catch(err => {
      // Handle axios errors and ensure that no additional responses are sent
      return res.status(500).send('Error finding flight: ' + err.message);
    });

  } catch (err) {
    return res.status(500).json({ message: 'Error retrieving user or flight', error: err.message });
  } 
});


app.get('/retrievemyflights', authenticateToken, (req, res) => {
  const { 
    scheduleDate, 
    scheduleTime, 
    flightName, 
    flightDirection, 
    airline, 
    airlineCode, 
    route, 
    includedelays, 
    page = 1,            // Default to page 1 if not provided
    sort, 
    fromDateTime, 
    toDateTime, 
    searchDateTimeField, 
    fromScheduleDate, 
    toScheduleDate,  
    isOperationalFlight 
  } = req.query;

  // Construct the query object dynamically
  let query = {};

  // Add each parameter to the query if it exists
  if (scheduleDate) query.scheduleDate = scheduleDate;
  if (scheduleTime) query.scheduleTime = scheduleTime;
  if (flightName) query.flightName = flightName;
  if (flightDirection) query.flightDirection = flightDirection;
  if (airline) query.airline = airline;
  if (airlineCode) query.airlineCode = airlineCode;
  if (route) query.route = route;
  if (isOperationalFlight !== undefined) query.isOperationalFlight = isOperationalFlight;

  // Handle date ranges if both fromDateTime and toDateTime are provided
  if (fromDateTime && toDateTime && searchDateTimeField) {
      query[searchDateTimeField] = {
          $gte: new Date(fromDateTime),  // Greater than or equal to
          $lte: new Date(toDateTime)    // Less than or equal to
      };
  }

  // Handle date range filtering for scheduleDate if fromScheduleDate and toScheduleDate are provided
  if (fromScheduleDate && toScheduleDate) {
      query.scheduleDate = {
          $gte: new Date(fromScheduleDate),
          $lte: new Date(toScheduleDate)
      };
  }

  // Include delays if required (assuming it's a boolean flag)
  if (includedelays) {
      query.delays = { $exists: true };  // Check if delays exist
  }

  // Handle sorting (assuming sorting format is like "field:asc" or "field:desc")
  let sortOptions = {};
  if (sort) {
      const [field, order] = sort.split(':');
      sortOptions[field] = order === 'desc' ? -1 : 1;
  }

  // Pagination logic (assuming 10 items per page)
  const limit = 10;
  const skip = (page - 1) * limit;

  // Execute the query with the constructed query object, sort, pagination
  Flight.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .then(response => {
          return res.status(200).send(response);
      })
      .catch(error => {
          return res.status(500).send(error.message);
      });
});

app.post('/retrievemyflightsviauserid', (req, res) => {
    const userId = req.body.userId;
    if(userId){
      Flight.find({ userId: userId }).then(response => res.status(200).send(response)).catch(err => res.status(500).send(err.message));
    }
});

app.post('/deletemyflight', async (req, res) => {
    const flightId = req.body.flightId;
    const deletedRecord = await Flight.deleteOne({flightId});
    try{if(deletedRecord)
    {
      return res.status(200).send({"message": "Record deleted"});
    }
    else{
      return res.status(500).send({"message": "Not Deleted"});
    }}
    catch(err){
      console.log(err);
    }
});



app.listen(process.env.PORT, () => {
    console.log(`App is listening on ${process.env.PORT}`);
});

