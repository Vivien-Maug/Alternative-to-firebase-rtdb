
// Todo: change it by getting from database, and manage the case listName.indexOf in modifyIssue
const listName = ["Vivien", "Aria", "Paul", "Anne"]


const issueName = {
    name: 0,
    desc: 1,
    assignedTo: 2
};

addIssue("2", "Bad translation", "blabla translation", "Vivien");
addIssue("3", "Bad ", "blabla ", "Paul");


function addIssue(id, name, description, assignedTo) {
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
    listName.forEach(name => {
        if (name === assignedTo)
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
    if (key === issueName.name) {
        document.getElementById(`issueName${id}`).value = value;
    }
    else if (key === issueName.desc) {
        document.getElementById(`issueDescription${id}`).value = value;
    }
    else if (key === issueName.assignedTo) {
        document.getElementById(`issueAssignedTo${id}`).getElementsByTagName('option')[listName.indexOf(value) + 1].selected = 'selected';
    }
}

let websocket = null;
try {
    websocket = new WebSocket("wss://localhost:8000");
} catch (err) {
    console.error(err);
}

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
    };

    this.send("Hello from client!");
};