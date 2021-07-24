
// Todo: and manage the case membersName.indexOf in modifyIssue
const membersName = new Map();

const issueNameRow = {
    id: 0,
    name: 1,
    desc: 2,
    member: 3,
    all: 4
};
const memberNameRow = {
    id: 0,
    name: 1,
    all: 2
};
const action = {
    init: 0,
    addToDB: 1,
    modifyToDB: 2,
    removeToDB: 3,
    DB_new: 4,
    DB_modify: 5,
    DB_remove: 6
};
const table = {
    member: 0,
    issue: 1
};


function addIssue(id, name, description, member_id) {
    const trHtml = document.createElement("tr");
    const thId = document.createElement("th");
    thId.innerHTML = id;
    thId.setAttribute("scope", "row");
    thId.setAttribute("id", `issueId${id}`);
    const tdName = document.createElement("td");
    tdName.innerHTML = `<input type="text" id="issueName${id}" value="${name}" maxlength = "50" >`;
    const tdDesc = document.createElement("td");
    tdDesc.innerHTML = `<textarea id="issueDescription${id}" maxlength = "250" >${description}</textarea>`;
    const tdAssigned = document.createElement("td");
    const selectAssigned = document.createElement("select");
    selectAssigned.setAttribute("class", "form-select");
    selectAssigned.setAttribute("id", `issueAssignedTo${id}`);
    selectAssigned.innerHTML = "<option>Select someone</option>";
    membersName.forEach((name, id) => {
        if (member_id === id)
            selectAssigned.innerHTML += `<option selected>${name}</option>`;
        else
            selectAssigned.innerHTML += `<option>${name}</option>`;
    });
    tdAssigned.appendChild(selectAssigned);
    trHtml.appendChild(thId);
    trHtml.appendChild(tdName);
    trHtml.appendChild(tdDesc);
    trHtml.appendChild(tdAssigned);
    document.getElementById("tbodyIssues").appendChild(trHtml);


    document.getElementById(`issueName${id}`).addEventListener('input', (event) => {
        console.log(`You modify: ${event.target.value}`);
        websocket.send("" + action.modifyToDB + table.issue + issueNameRow.name + JSON.stringify([id, event.target.value]));
    });
    document.getElementById(`issueDescription${id}`).addEventListener('input', (event) => {
        console.log(`You modify: ${event.target.value}`);
        websocket.send("" + action.modifyToDB + table.issue + issueNameRow.desc + JSON.stringify([id, event.target.value]));
    });
    document.getElementById(`issueAssignedTo${id}`).addEventListener('input', (event) => {
        console.log(`You modify: ${event.target.value}`);
        let idMember;
        membersName.forEach((name, id) => {
            if (event.target.value === name) {
                idMember = id;
            }
        });
        if (idMember) {
            websocket.send("" + action.modifyToDB + table.issue + issueNameRow.member + JSON.stringify([id, idMember]));
        } else {
            // TODO
        }
    });
}

function modifyIssue(id, key, value) {
    if (key === issueNameRow.name) {
        document.getElementById(`issueName${id}`).value = value;
    }
    else if (key === issueNameRow.desc) {
        document.getElementById(`issueDescription${id}`).value = value;
    }
    else if (key === issueNameRow.member) {
        document.getElementById(`issueAssignedTo${id}`).getElementsByTagName('option')[value].selected = 'selected';
    }
}

let websocket = null;
try {
    websocket = new WebSocket("wss://localhost:8000");
    websocket.onerror = function (error) {
        console.error(error);
    };

    websocket.onopen = function (event) {
        console.log("Connection established.");

        this.onclose = function (event) {
            console.log("Connection completed.");
        };

        this.onmessage = function (event) {
            if (event.data !== "error") {
                if (event.data.startsWith(action.init)) {
                    console.log(JSON.parse(event.data.substring(1)));
                    const data = JSON.parse(event.data.substring(1));
                    const membersLst = data[0];
                    const issuesLst = data[1];
                    membersLst.forEach(member => {
                        membersName.set(member[memberNameRow.id], member[memberNameRow.name]);
                    });
                    issuesLst.forEach(issue => {
                        addIssue(issue[issueNameRow.id], issue[issueNameRow.name], issue[issueNameRow.desc], issue[issueNameRow.member]); // TODO: manage case NULL for issue.member_id
                    });
                }

            }
        };
    };
} catch (err) {
    console.error(err);
}