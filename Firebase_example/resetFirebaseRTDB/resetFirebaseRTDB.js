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

const log = document.getElementById("logs");

document.getElementById("resetButton").addEventListener("click", () => {
    Promise.all([
        database.ref('member').remove().catch(error => {
            log.innerHTML += Date(Date.now()) + " Member remove: ERROR=" + error + "<br>";
        }),
        database.ref('issue').remove().catch(error => {
            log.innerHTML += Date(Date.now()) + " Issue remove: ERROR=" + error + "<br>";
        }),
    ]).then(() => {
        log.innerHTML += Date(Date.now()) + " Member remove: OK<br>";
        log.innerHTML += Date(Date.now()) + " Issue remove: OK<br>";

        const members = ['Vivien', 'Aria', 'Paul', 'Anne'];
        const issues = [['Bad UI Display', 'In contact view, the text "click here" is not aligned.', 1],
        ['Bad translation', 'Description 2', 2],
        ['Issue Name num 3', 'Description Issue 3', 3],
        ['Issue Name num 4', '', -1]];

        const promiseMembers = [];
        members.forEach(name => {
            const id = database.ref('member').push().key;
            promiseMembers.push(database.ref('member/' + id).set({
                member_name: name
            }));
        });
        Promise.all(promiseMembers).then(() => {
            log.innerHTML += Date(Date.now()) + " Member reset: OK<br>";
        }).catch(error => {
            log.innerHTML += + " Member reset: ERROR=" + error + "<br>";
        });
        const promiseIssues = [];
        issues.forEach(issue => {
            const id = database.ref('issue').push().key;
            promiseIssues.push(database.ref('issue/' + id).set({
                issue_name: issue[0],
                issue_description: issue[1],
                member_id: issue[2]
            }));
        });
        Promise.all(promiseIssues).then(() => {
            log.innerHTML += Date(Date.now()) + " Issue reset: OK<br>";
        }).catch(error => {
            log.innerHTML += Date(Date.now()) + " Issue reset: ERROR=" + error + "<br>";
        });
    })
});

