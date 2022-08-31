const pool = require("../db");
const express = require("express");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const moment = require("moment");

module.exports.register = async (req, res,next) => {
  const { name, email_id, password } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    let result = await client.query(
      `insert into credentials (name,email_id,password) values('${name}','${email_id}','${hashedPassword}') returning user_id`
    );
    if (result === undefined)
      return res.status(500).send("you couldnt register!");

    const newUserId = result.rows[0].user_id;
    
    const insertUserRole = await client.query(
      `insert into roles(user_id, role) values ('${newUserId}','user')`
    );
    if (insertUserRole === undefined)
      return res.status(500).send("you could not add role");

    console.log("PERSON IS REGISTERED!");
    res.status(200).send({ name, email_id, password });
  } catch (err) {
    //res.status(500).send(err)
    await client.query("ROLLBACK");
    return next(err);
  } finally {
    client.release();
  }
};
module.exports.login = async (req, res,next) => {
  const { email_id, password } = req.body;
  const cred = await pool.query(
    `select * from credentials where email_id='${email_id}'`
  );

  if (cred.rows.length === 0) {
    return res.status(400).send("User not found");
  }
  try {
    if (await bcrypt.compare(password, cred.rows[0].password)) {
      let userID = await pool.query(
        `select user_id from credentials where email_id='${email_id}'`
      );
      let storeUserId = await pool.query(
        `insert into sessions(user_id) values ('${userID.rows[0].user_id}')`
      );
      let sessionId = await pool.query(
        `select s_id from sessions where user_id='${userID.rows[0].user_id}'`
      );
      const user_cred = {
        id: cred.rows[0].user_id,
        sessionID: sessionId.rows[0].s_id,
      };

      const accessToken = jwt.sign(user_cred, process.env.ACCESS_TOKEN, {
        expiresIn: "15m",
      });
      res.json({ accessToken: accessToken });
    } else {
      res.status(401).send("Incorrect password given.");
    }
  } catch (err) {
    return next(err);
  }
};

module.exports.address = async (req, res,next) => {
  const { addr, geopoint } = req.body;

  const userId = req.user.id;

  try {
    await pool.query(
      "insert into address (user_id,addr,geopoint) values($1,$2,$3) ",
      [userId, addr, geopoint]
    );
    res.status(200).send("address is successfully added");
  } catch (err) {
    //res.status(500).send(err)
    return next(err);
  }
};

module.exports.fetchResturants = async (req, res,next) => {
  try {
    let { offset = 0, limit = 5 } = req.query;
    let result = await pool.query(
      `select res_name,res_addr,geopoint from resturants where is_archieved='false' limit ${limit} offset ${offset}`
    );
    res.status(200).send(result.rows);
  } catch (err) {
    console.log(err);
    //res.status(500).send(err)
    return next(err);
  }
};
module.exports.fetchDishes = async (req, res,next) => {
  const r_id = req.params.id;
  try {
    let { offset = 0, limit = 5 } = req.query;
    let result = await pool.query(
      `select dish_name from dish where r_id='${r_id}' and is_archieved='false' limit ${limit} offset ${offset}`
    );
    res.status(200).send(result.rows);
  } catch (err) {
    //res.status(500).send(err)
    return next(err);
  }
};

module.exports.logout = async (req, res,next) => {
  try {
    // let now = moment();
    // let time = now.date() + now.hour() + ':' + now.minutes() + ':' + now.seconds();
    // time = time + ((now.hour()) >= 12 ? ' PM' : ' AM');
    // console.log(time)
    let time = moment().format();

    await pool.query("update sessions set end_time=$1 where s_id=$2", [
      time,
      req.user.sessionID,
    ]);
    res.status(200).send("logged out seccessfully");
  } catch (err) {
    return next(err);
  }
};
