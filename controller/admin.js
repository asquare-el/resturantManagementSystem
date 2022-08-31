const pool = require("../db");
const express = require("express");
require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports.login = async (req, res, next) => {
  const { email_id, password } = req.body;
  const cred = await pool.query(
    `select * from credentials where email_id='${email_id}'`
  );
  let role_type = await pool.query(
    `select * from roles where user_id='${cred.rows[0].user_id}' and role ='admin'`
  );
  if (role_type.rows.length == 0) {
    return res.status(403).send("You are not admin");
  }

  if (cred.rows.length === 0) {
    return res.status(400).send("Admin not found");
  }
  try {
    if (await bcrypt.compare(password, cred.rows[0].password)) {
      let userID = await pool.query(
        `select user_id from credentials where email_id='${email_id}'`
      );
      await pool.query(
        `insert into sessions(user_id) values ('${userID.rows[0].user_id}')`
      );
      let sessionId = await pool.query(
        `select s_id from sessions where user_id='${userID.rows[0].user_id}'`
      );

      const user_cred = {
        id: cred.rows[0].user_id,
        sessionID: sessionId.rows[0].s_id,
        role: role_type.rows[0].role,
      };

      const accessToken = jwt.sign(user_cred, process.env.ACCESS_TOKEN, {
        expiresIn: "15m",
      });
      res.status(200).json({ accessToken: accessToken, message: "good" });
    } else {
      res.status(401).send("Incorrect password given.");
    }
  } catch (err) {
    return next(error);
  }
};

module.exports.addResturant = async (req, res, next) => {
  const { res_name, res_addr, geopoint } = req.body;
  const userId = req.user.id;
  try {
    await pool.query(
      `insert into resturants(user_id,res_name,res_addr,geopoint) values ('${userId}','${res_name}','${res_addr}','${geopoint}')`
    );
    res.status(200).send("resturant address is added successfuly");
  } catch (err) {
    //res.status(500).send(err)
    return next(error);
  }
};

module.exports.addDish = async (req, res, next) => {
  const { dish_name } = req.body;
  const r_id = req.params.id;
  const userId = req.user.id;
  console.log(dish_name);
  console.log(r_id);
  console.log(userId);

  try {
    await pool.query(
      `insert into dish(r_id,dish_name,user_id) values ('${r_id}','${dish_name}', ${userId})`
    );
    res.status(200).send("Dish is added successfuly");
  } catch (err) {
    return next(error);
  }
};

module.exports.createSubadmin = async (req, res, next) => {
  const { name, email_id, password } = req.body;
  const userId = req.user.id;
  try {
    let checkExistence = await pool.query(
      `select * from credentials where user_id='${userId}'`
    );
    if (checkExistence === 0) {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      let result = await pool.query(
        `insert into credentials (name,email_id,password,created_by) values('${name}','${email_id}','${hashedPassword}','${userId}') returning user_id`
      );
      console.log(result);
      if (result === undefined)
        return res.status(500).send("couldnt create something went wrong!");

      const newUserId = result.rows[0].user_id;
      console.log(newUserId);
      const insertUserRole = await pool.query(
        `insert into roles(user_id, role) values ('${newUserId}','subadmin')`
      );
      if (insertUserRole === undefined)
        return res
          .status(500)
          .send("couldnt insert role. Something went wrong!");
      console.log("SUBADMIN IS CREATED!");
      res.status(200).send({ name, email_id, password });
    } else {
      let checkRole = await pool.query(
        `select * from roles where user_id='${userId}'`
      );
      if (checkRole.rows[0].role != "subadmin") {
        const insertUserRole = await pool.query(
          `insert into roles(user_id, role) values ('${userId}','subadmin')`
        );
        if (insertUserRole === undefined)
          return res
            .status(500)
            .send("couldnt insert role. Something went wrong!");
        console.log("SUBADMIN IS CREATED!");
        res.status(200).send({ name, email_id, password });
      }
    }
  } catch (err) {
    //res.status(500).send(err)
    return next(err);
  }
};

module.exports.createUser = async (req, res, next) => {
  const { name, email_id, password } = req.body;
  const userId = req.user.id;
  try {
    let checkExistence = await pool.query(
      `select * from credentials where email_id='${email_id}'`
    );
    console.log(checkExistence);
    if (checkExistence.rows.length === 0) {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      let result = await pool.query(
        `insert into credentials (name,email_id,password,created_by) values('${name}','${email_id}','${hashedPassword}','${userId}') returning user_id`
      );
      console.log(result);
      if (result === undefined)
        return res.status(500).send("couldnt create something went wrong!");

      const newUserId = result.rows[0].user_id;
      console.log(newUserId);
      const insertUserRole = await pool.query(
        `insert into roles(user_id, role) values ('${newUserId}','user')`
      );
      if (insertUserRole === undefined)
        return res
          .status(500)
          .send("couldnt insert role. Something went wrong!");
      console.log("USER IS CREATED!");
      res.status(200).send({ name, email_id, password });
    } else {
      res.send("already exists");
    }
  } catch (err) {
    //res.status(500).send(err)
    return next(err);
  }
};

module.exports.fetchSubadmin = async (req, res, next) => {
  try {
    let result = await pool.query(
      `select name,email_id from credentials inner join roles on credentials.user_id=roles.user_id where roles.role ='subadmin'and is_archieved='false'`
    );
    res.status(200).send(result);
  } catch (err) {
    //console.log(err)
    //res.status(500).send(err)
    return next(err);
  }
};

module.exports.fetchUser = async (req, res, next) => {
  try {
    let result = await pool.query(
      `select name,email_id from credentials inner join roles on credentials.user_id=roles.user_id where roles.role ='user'and is_archieved='false'`
    );
    res.status(200).send(result);
  } catch (err) {
    return next(err);
  }
};

module.exports.fetchAddress = async (req, res, next) => {
  const user_id = req.params.id;
  try {
    let result = await pool.query(
      `select addr,geopoint from address where user_id='${user_id}'`
    );
    res.status(200).send(result);
  } catch (err) {
    return next(err);
  }
};

module.exports.logout = async (req, res, next) => {
  try {
    let time = moment().format();

    await pool.query("update sessions set end_time=$1 where s_id=$2", [
      time,
      req.user.sessionID,
    ]);
    res.status(200).send("logged out seccessfully");
  } catch (err) {
    //res.status(403).send('cannot logout, check again.')
    //console.log(err)
    return next(err);
  }
};
