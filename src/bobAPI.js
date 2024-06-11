function bobRequette({ action = "get", collection = undefined, body = undefined, id = undefined, index = undefined, controller, token = undefined, strategy = "local", authorization = undefined, callback = () => { } }) {
    const jwt = token;
    const jsonData = {
        action,
        collection,
        body,
        controller,
        _id: id,
        jwt,
        index,
        strategy,
    };
    const jsonString = JSON.stringify(jsonData);
    fetch("https://bob-api.run.innovation-laposte.io/_query", {
        "headers": {
            "content-type": "application/json; charset=utf-8",
            "authorization": authorization ? `Bearer ${authorization}` : ""
        },
        "body": jsonString,
        "method": "POST"
    }).then(response => { return response.json() })
        .then(data => {
            callback(data);
        })
        .catch(err => console.log(err));
}
function login(username, password, callback = () => { }) {
    bobRequette({
        action: "login", body: { username, password }, controller: "auth", callback: (data) => {
            token = data.result.jwt;
            setTimeout(() => {
                login(username, password)
            }, data.result.expiresAt - Date.now());
            callback(token);
        }
    });
}
function getMoods(callback) {
    bobRequette({
        action: "get", collection: "daily_moodsgroup", controller: "document", index: "bob", token, id: "cNY0t40BBT2uGxRqaH3l", callback: (data) => {
            callback(data.result._source.dailyMoods);
        }
    })
}
module.exports = {
    bobRequette,
    login,
    getMoods
}
