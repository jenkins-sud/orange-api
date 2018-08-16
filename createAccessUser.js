// Note: This command uses arguments passed in via the command line, rather than
// using environment variables, because, when running in docker, the environment
// variables will be set in your docker container and not necessarily on the
// machine running this script.

const Client = require('node-rest-client').Client;
const authUrl = `${process.argv[2]}/user`;

const client = new Client();

const userArgs = {
    headers : {"Content-Type": "application/json"},
    data: {
        email: "admin@amida.com",
        username: process.argv[3],
        password: process.argv[4],
        scopes: ["admin"]
    }
}

const createUser = function(args, callback) {
    client.post(authUrl, userArgs, function (data, response) {
        callback(data);
    });
};

const main = function () {
    createUser(userArgs, function(response) {
        console.log("Created user on auth service", response);
    })
}

main();
