const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const pg = require('pg')

const { Pool } = require('pg')
const db = new Pool({
  user: 'rubi',
  host: 'localhost',
  database: 'datadb',
  password: '12345',
  port: 5432,
})

const app = express()

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'))
})

app.get('/datatable', async (req, res) => {
    let params = []

    if(req.query.search.value){
        params.push(`username ilike '%${req.query.search.value}%'`)
    }

    const limit = req.query.length
    const offset = req.query.start

    const total = await db.query(`select count(*) as total from users${params.length > 0 ? ` where ${params.join(' or ')}` : ''}`)
    const data = await db.query(`select * from users${params.length > 0 ? ` where ${params.join(' or ')}` : ''} limit ${limit} offset ${offset}`)
    const response = {
        "draw": Number(req.query.draw),
        "recordsTotal": total.rows[0].total,
        "recordsFiltered": total.rows[0].total,
        "data": data.rows
      }
    res.json(response)
})

app.listen(3500, (err) => {
    console.log('app working on port 3500')
})