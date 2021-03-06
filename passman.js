#!/usr/bin/env node
const program = require("commander");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
var generator = require("generate-password");

const AUTH_LOCATION = path.resolve(__dirname, "../auth.json");

const readFile = fp => {
  if (!fs.existsSync(fp)) {
    return {};
  }
  const result = fs.readFileSync(fp, { encoding: "utf8" });
  return JSON.parse(result);
};

const authInfo = readFile(AUTH_LOCATION);

const writeFile = () => {
  fs.writeFile(AUTH_LOCATION, JSON.stringify(authInfo), err => {
    if (err) console.log("An error occurred updating password file");
  });
};

const makePassword = (pwd, un) => {
  let _pwd = pwd;
  if (!_pwd) {
    _pwd = generator.generate({
      length: 10,
      numbers: true,
      symbols: true,
      uppercase: true,
      strict: true,
      excludeSimilarCharacters: true
    });
  }
  bcrypt
    .hash(_pwd, 10)
    .then(hash => {
      authInfo[un] = hash;
      writeFile();
      if (!pwd) console.log("Your password is " + _pwd);
    })
    .catch(error => {
      console.error("Could not create password " + error.message);
    });
};

program.version("1.0.0").description("Manages a password file for a web app");

program
  .command("addLogin <username> [password]")
  .alias("c")
  .description("Add a new login")
  .action((un, pwd) => {
    if (authInfo[un]) {
      console.log(
        "A user with this username already exists. Please use newPass to change the password or removeLogin to remove the login"
      );
      return;
    }
    makePassword(pwd, un);
  });

program
  .command("newPass <username> [password]")
  .alias("p")
  .description("Changes an existing user's password")
  .action((un, pwd) => {
    if (!authInfo[un]) {
      console.log(
        "A user with this username does not exist. Please use addLogin to create the user"
      );
      return;
    }
    makePassword(pwd, un);
  });

program
  .command("removeLogin <username>")
  .alias("r")
  .description("Remove an existing login")
  .action(un => {
    if (!authInfo[un]) {
      console.log("A user with this username does not exist");
      return;
    }
    delete authInfo[un];
    writeFile();
  });

program.parse(process.argv);
