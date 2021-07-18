
// Todo: and manage the case membersName.indexOf in modifyIssue
const membersName = new Map();

const issueNameRow = {
    name: 0,
    desc: 1,
    member: 2
};


function addIssue(id, name, description, member_id) {
    const trHtml = document.createElement("tr");
    const thId = document.createElement("th");
    thId.innerHTML = id;
    thId.setAttribute("scope", "row");
    thId.setAttribute("id", `issueId${id}`);
    const tdName = document.createElement("td");
    tdName.innerHTML = `<input type="text" id="issueName${id}" value="${name}">`;
    const tdDesc = document.createElement("td");
    tdDesc.innerHTML = `<textarea id="issueDescription${id}" rows="2">${description}</textarea>`;
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
            console.log("Message:", event.data);
            if (event.data !== "error") {
                const data = JSON.parse(event.data);
                const membersLst = data[0];
                const issuesLst = data[1];
                membersLst.forEach(member => {
                    membersName.set(member.member_id, member.member_name);
                });

                issuesLst.forEach(issue => {
                    addIssue(issue.issue_id, issue.issue_name, issue.issue_description, issue.member_id); // TODO: manage case NULL for issue.member_id
                });
            }
        };
    };
} catch (err) {
    console.error(err);
}