const express = require('express')
const router = express.Router()

const bcrypt = require('bcrypt')
const { Client } = require('pg')
const { query } = require('express')
const cookieParser = require('cookie-parser')
const { SmsCommandContext } = require('twilio/lib/rest/supersim/v1/smsCommand')

var accountSid = process.env.TWILIO_ACCOUNT_SID = 'AC122de17d037c7245535686b0d3661108';
var authToken = process.env.TWILIO_ACCOUNT_AUTH_TOKEN = '1e3d65849f7de5d7b307930a68a92324';

const sms = require('twilio')(accountSid, authToken, {
  lazyLoading: true
})

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    password: 'project',
    database: 'bellElevator'
})

client.connect()

router.post('/registerAdmin', async (req, res) => {
    const firstName = req.body.firstName
    const lastName = req.body.lastName
    const email = req.body.email
    const phoneNumber = req.body.phoneNumber

    const password = req.body.password
    const hash = await bcrypt.hash(password, 10)

    const user = await client.query({
        text: "SELECT * FROM users WHERE email=$1 OR (firstName=$2 AND lastName=$3)",
        values: [email, firstName, lastName]
    })

    if (user.rows.length != 0) {
        if (user.rows[0].email == email) {
          res.status(400).json({ message: 'Account already exists with that email' })
        }
    
        else if (user.rows[0].firstName == firstName && user.rows[0].lastName == lastName) {
          res.status(400).json({ message: 'Already has an account' })
        }
      }
    
      else {
        await client.query({
          text: `INSERT INTO admin (email, password, firstname, lastname, phone_number) VALUES ($1,$2,$3,$4,$5)`,
          values: [email, hash, firstName, lastName, phoneNumber]
        }),

        await client.query({
            text: `INSERT INTO users (email, password, firstname, lastname, phone_number) VALUES ($1,$2,$3,$4,$5)`,
            values: [email, hash, firstName, lastName, phoneNumber]
        })

        res.json("success")
      }
}),

router.post('/registerEmployee', async (req, res) => {
    const companyName = req.body.company
    const firstName = req.body.firstName
    const lastName = req.body.lastName
    const email = req.body.email
    const phoneNumber = req.body.phoneNumber

    const password = req.body.password
    const hash = await bcrypt.hash(password, 10)

    const user = await client.query({
        text: "SELECT * FROM employees WHERE email=$1 OR (firstName=$2 AND lastName=$3)",
        values: [email, firstName, lastName]
    })

    const companyId = await client.query({
        text: "SELECT id FROM companies WHERE name=$1",
        values: [companyName]
    })

    if (user.rows.length != 0) {
        if (user.rows[0].email == email) {
          res.status(400).json({ message: 'Account already exists with that email' })
        }
    
        else if (user.rows[0].firstName == firstName && user.rows[0].lastName == lastName) {
          res.status(400).json({ message: 'Already has an account' })
        }
    }
    
    else if (companyId.rows.length == 0) {
        res.status(400).json({message: 'Company does not exist'})
    }
    
    else {
        await client.query({
            text: "INSERT INTO employees (email, password, firstname, lastname, phone_number,company) VALUES ($1,$2,$3,$4,$5,$6)",
            values: [email, hash, firstName, lastName, phoneNumber, companyId.rows[0].id]
        }),

        await client.query({
            text: "INSERT INTO users (email, password, firstname, lastname, phone_number) VALUES ($1,$2,$3,$4,$5)",
            values: [email, hash, firstName, lastName, phoneNumber]
        })

        res.json("success")
    }
}),

router.post('/registerOperator', async (req, res) => {
  const firstName = req.body.firstName
  const lastName = req.body.lastName
  const email = req.body.email
  const phoneNumber = req.body.phoneNumber

  const password = req.body.password
  const hash = await bcrypt.hash(password, 10)

  const user = await client.query({
      text: "SELECT * FROM operators WHERE email=$1 OR (firstName=$2 AND lastName=$3)",
      values: [email, firstName, lastName]
  })

  
  if (user.rows.length != 0) {
      if (user.rows[0].email == email) {
        res.status(400).json({ message: 'Operator already exists with that email' })
      }
  
      else if (user.rows[0].firstName == firstName && user.rows[0].lastName == lastName) {
        res.status(400).json({ message: 'Operator already has an account' })
      }
  }
  
  else {
      await client.query({
          text: "INSERT INTO operators (email, password, firstname, lastname, phone_number) VALUES ($1,$2,$3,$4,$5)",
          values: [email, hash, firstName, lastName, phoneNumber]
      }),

      await client.query({
          text: "INSERT INTO users (email, password, firstname, lastname, phone_number) VALUES ($1,$2,$3,$4,$5)",
          values: [email, hash, firstName, lastName, phoneNumber]
      })

      res.json("success")
  }
}),

router.post('/login', async (req, res) => {
    const email = req.body.email
    const password = req.body.password

    const user = await client.query({
      text: "SELECT * FROM users WHERE email=$1",
      values: [email]
    })

    if (user.rows.length != 0) {
      if (await req.session.userId == user.rows[0].id) {
        res.status(401).json({ message: 'Already authentified' })
      }

      else {
        if (await bcrypt.compare(password, user.rows[0].password)) {
          req.session.userId = user.rows[0].id
          res.json("Welcome back " + user.rows[0].firstname)
        }

        else {
          res.status(403).json({message: "Wrong password"})
        }
      }
    }

    else {
      res.status(404).json({message: 'Account does not exist'})
    }
}),

router.post('/addCompany', async (req, res) => {
    const name = req.body.name
    const description = req.body.description
    const nbElevators = req.body.nbElevators
    const nbBuildings = req.body.nbBuildings

    const company = await client.query({
        text: "SELECT * FROM companies WHERE name=$1",
        values: [name]
    })

    if (company.rows.length != 0) {
        res.status(400).json({message: 'Company already exists'})
    }

    else {
        await client.query({
            text: "INSERT INTO companies (name, nb_elevator, nb_building, description) VALUES ($1, $2, $3, $4)",
            values: [name, nbElevators, nbBuildings, description]
        })
        res.json("Success")
    }
    
}),

router.post('/addBuilding', async (req, res) => {
    const name = req.body.name
    const company = req.body.company
    const address = req.body.address
    const nbElevators = req.body.nbElevators

    const companyCheck = await client.query({
        text: "SELECT * FROM companies WHERE name=$1",
        values: [company]
    })
    
    const buildingCheck = await client.query({
        text: "SELECT * FROM buildings WHERE name=$1",
        values: [name]
    })

    if (companyCheck.rows.length == 0){
        res.status(404).json({message: "Company does not exist"})
    }

    else {
        /*if (companyCheck.rows[0].name == company && buildingCheck.rows[0].name == name) {
            res.status(400).json({message: 'Building already exists'})
        }

        else {*/
            await client.query({
                text: "INSERT INTO buildings (name, address, nb_elevators, owner) VALUES ($1, $2, $3, $4)", 
                values: [name, address, nbElevators, companyCheck.rows[0].id]
            })
            res.json("Success")
        
    }   
}),

router.get('/getBuildings/:companyId', async (req, res) => {
  const userId = req.session.userId
  const companyId = parseInt(req.params.companyId)

  const buildings = await client.query({
    text: "SELECT * FROM buildings WHERE owner=$1",
    values: [companyId]
  })
  res.json(buildings.rows)
}),

router.post('/addElevator/:buildingId', async (req, res) => {
  const buildingId = req.params.buildingId
  const model = req.body.model
  const lastRevision = req.body.lastRevision
  
  const buildingCheck = await client.query({
    text: "SELECT * FROM buildings WHERE id=$1 ",
    values: [buildingId]
  })

  if (buildingCheck.rows.length == 0){
    res.status(400).json({message: 'building does not exist'})
  }

  else {
    await client.query({
      text: "INSERT INTO elevators (model, last_revision, building) VALUES ($1, $2, $3)",
      values: [model, lastRevision, buildingId]
    })

    res.json("Success")
  }

}),

router.get('/getElevators/:buildingId', async (req, res) => {
  buildingId = req.params.buildingId

  const buildingCheck = await client.query({
    text: "SELECT * FROM buildings WHERE id=$1 ",
    values: [buildingId]
  })

  if (buildingCheck.rows.length == 0){
    res.status(400).json({message: 'building does not exist'})
  }

  else {
    elevators = await client.query({
      text: "SELECT * FROM elevators WHERE building=$1",
      values: [buildingId]
    })

    res.json(elevators.rows)
  }


}),

router.put('/updateElevator', (req, res) => {

}),

router.delete('/removeElevator', (req, res) => {

}),

router.post('/addIssue/:idElevator', async (req, res) => {
  const idElevator = req.params.idElevator
  const date = Date.now().toString()
  const problem = req.body.problem

  const checkElevator = await client.query({
    text: "SELECT * FROM elevators WHERE id=$1",
    values: [idElevator]
  })

  const operator = await client.query({
    text: "SELECT * FROM  operators ORDER BY RANDOM() LIMIT 1",
  })

  if (checkElevator.rows.length == 0) {
    res.status(400).json({message: 'Elevator does not exist'})
  }

  else {
    await client.query({
      text: "INSERT INTO pannes (date, elevator, operator, problem) VALUES ($1, $2, $3, $4)",
      values: [date, idElevator, operator.rows[0].id, problem]
    })

    await client.query({
      text: "INSERT INTO intervention (date, elevator, operator) VALUES ($1, $2, $3)",
      values: [date, idElevator, operator.rows[0].id]
    })

    await sms.messages
      .create({
        body: 'An issue appeared on elevator ' + idElevator + '. Issue caused by : ' + problem,        
        from: '+14044588378', 
        to: '+33781668745'

      })

      .then(message => console.log(message.id))

    res.json({message: "Success", phoneNumber: operator.rows[0].phoneNumber})
  }
}),

router.post('/addIntervention', (req, res) => {

}),

router.get('/getPlanning', (req, res) => {

}),

router.put('/modifyIntervention', (req, res) => {

}),

router.delete('/deleteIntervention', (req, res) => {

}),

module.exports = router

