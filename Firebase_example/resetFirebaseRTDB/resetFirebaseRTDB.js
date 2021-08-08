// firebaseConfig data is in file firebaseConfig.js. Below is an example of empty content

// var firebaseConfig = {
//     apiKey: "",
//     authDomain: "",
//     databaseURL: "",
//     projectId: "",
//     storageBucket: "",
//     messagingSenderId: "",
//     appId: ""
// };

firebase.initializeApp(firebaseConfig);
var database = firebase.database();

const issueNameRow = {
    id: 0,
    name: 1,
    desc: 2,
    member: 3
};
const memberNameRow = {
    id: 0,
    name: 1
};
const table = {
    member: 0,
    issue: 1
};

const log = document.getElementById("logs");

document.getElementById("resetButton").addEventListener("click", () => {
    Promise.all([
        database.ref("" + table.member).remove().catch(error => {
            log.innerHTML += Date(Date.now()) + " Member remove: ERROR=" + error + "<br>";
        }),
        database.ref("" + table.issue).remove().catch(error => {
            log.innerHTML += Date(Date.now()) + " Issue remove: ERROR=" + error + "<br>";
        }),
    ]).then(() => {
        log.innerHTML += Date(Date.now()) + " Member remove: OK<br>";
        log.innerHTML += Date(Date.now()) + " Issue remove: OK<br>";

        const members = ['Vivien', 'Aria', 'Paul', 'Anne'];
        const membersId = [];
        const issues = [['Bad UI Display', 'In contact view, the text "click here" is not aligned.', 1],
        ['Bad translation', 'Description 2', 2],
        ['Issue Name num 3', 'Description Issue 3', 3],
        ['Issue Name num 4', '', -1]];

        const promiseMembers = [];
        members.forEach(name => {
            const id = database.ref("" + table.member).push().key;
            membersId.push(id);
            promiseMembers.push(database.ref(table.member + '/' + id).set({
                [memberNameRow.name]: name
            }));
        });
        Promise.all(promiseMembers).then(() => {
            log.innerHTML += Date(Date.now()) + " Member reset: OK<br>";
        }).catch(error => {
            log.innerHTML += + " Member reset: ERROR=" + error + "<br>";
        });
        const promiseIssues = [];
        issues.forEach(issue => {
            const id = database.ref("" + table.issue).push().key;
            promiseIssues.push(database.ref(table.issue + '/' + id).set({
                [issueNameRow.name]: issue[0],
                [issueNameRow.desc]: issue[1],
                [issueNameRow.member]: (issue[2] != -1) ? membersId[issue[2]] : ""
            }));
        });
        Promise.all(promiseIssues).then(() => {
            log.innerHTML += Date(Date.now()) + " Issue reset: OK<br>";
        }).catch(error => {
            log.innerHTML += Date(Date.now()) + " Issue reset: ERROR=" + error + "<br>";
        });
    })
});

