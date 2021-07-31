// Todo: and manage the case membersName.indexOf in modifyIssue
const membersName = new Map();
const highlightElements = new Map();

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
    DB_remove: 6,
    error: 7
};
const table = {
    member: 0,
    issue: 1,
    unknown: 2
};
const error = {
    unableToInit: 0,
    unableToAdd: 1,
    unableToModify: 2,
    unableToDelete: 3,
    deleteMemberAssigned: 4
}


function addIssue(id, name, description, member_id, toHighlight = false) {
    if (!description) {
        description = '';
    }
    const trHtml = document.createElement("tr");
    trHtml.id = `issueTr${id}`;
    const thId = document.createElement("th");
    thId.classList.add("text-center");
    thId.innerHTML = id;
    thId.setAttribute("scope", "row");
    thId.setAttribute("id", `issueId${id}`);
    const tdName = document.createElement("td");
    tdName.classList.add("text-center");
    tdName.innerHTML = `<input type="text" class="form-control" id="issueName${id}" value="${name}" maxlength = "50" >`;
    const tdDesc = document.createElement("td");
    tdDesc.classList.add("text-center");
    tdDesc.innerHTML = `<textarea class="form-control" id="issueDescription${id}" maxlength = "250" rows="3">${description}</textarea>`;
    const tdAssigned = document.createElement("td");
    tdAssigned.classList.add("text-center");
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
    const tdButtonRemove = document.createElement("td");
    // Icon from https://icons.getbootstrap.com/icons/trash/
    tdButtonRemove.innerHTML = `<div class="d-grid gap-2"><button type="button" class="btn btn-warning btn-lg mx-auto" id="issueRemove${id}"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-trash"
    viewBox="0 0 16 16">
    <path
        d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
    <path fill-rule="evenodd"
        d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
</svg></button></div>`;
    trHtml.appendChild(thId);
    trHtml.appendChild(tdName);
    trHtml.appendChild(tdDesc);
    trHtml.appendChild(tdAssigned);
    trHtml.appendChild(tdButtonRemove);
    if (toHighlight) {

        trHtml.classList.add("table-primary");
        if (highlightElements.has(trHtml.id)) {
            clearTimeout(highlightElements.get(trHtml.id));
        }
        const timeout = setTimeout(() => {
            document.getElementById(trHtml.id).classList.remove("table-primary");
            highlightElements.delete(trHtml.id);
        }, 1000);
        highlightElements.set(trHtml.id, timeout);
    }
    document.getElementById("tbodyIssues").appendChild(trHtml);


    document.getElementById(`issueName${id}`).addEventListener('input', (event) => {
        websocket.send("" + action.modifyToDB + table.issue + issueNameRow.name + JSON.stringify([id, event.target.value]));
    });
    document.getElementById(`issueDescription${id}`).addEventListener('input', (event) => {
        websocket.send("" + action.modifyToDB + table.issue + issueNameRow.desc + JSON.stringify([id, event.target.value]));
    });
    document.getElementById(`issueAssignedTo${id}`).addEventListener('input', (event) => {
        let idMember;
        membersName.forEach((name, id) => {
            if (event.target.value === name) {
                idMember = id;
            }
        });
        websocket.send("" + action.modifyToDB + table.issue + issueNameRow.member + JSON.stringify([id, idMember ? idMember : undefined]));
    });
    document.getElementById(`issueRemove${id}`).addEventListener('click', (event) => {
        websocket.send("" + action.removeToDB + table.issue + id);
        // The deletion is performed after the server has accepted it
        // TODO: Need to add an animation if this takes too long
    });
}

function modifyIssue(id, key, value) {
    let elementId;
    switch (key) {
        case issueNameRow.name:
            elementId = `issueName${id}`;
            break;
        case issueNameRow.desc:
            elementId = `issueDescription${id}`;
            break;
        case issueNameRow.member:
            elementId = `issueAssignedTo${id}`;
            break;
        default:
            console.error('Bad key');
            return;
    }
    if (key == issueNameRow.member) {
        document.getElementById(elementId).getElementsByTagName('option')[value ? value : 0].selected = 'selected';
    } else {
        document.getElementById(elementId).value = value;
    }

    document.getElementById(elementId).classList.add("bg-info");
    document.getElementById(elementId).classList.add("text-dark");
    if (highlightElements.has(elementId)) {
        clearTimeout(highlightElements.get(elementId));
    }
    const timeout = setTimeout(() => {
        document.getElementById(elementId).classList.remove("bg-info");
        document.getElementById(elementId).classList.remove("text-dark");
        highlightElements.delete(elementId);
    }, 1000);
    highlightElements.set(elementId, timeout);
}

function addMember(id, name, toHighlight = false) {
    const trHtml = document.createElement("tr");
    trHtml.id = `memberTr${id}`;
    const thId = document.createElement("th");
    thId.classList.add("text-center");
    thId.innerHTML = id;
    thId.setAttribute("scope", "row");
    thId.setAttribute("id", `memberId${id}`);
    const tdName = document.createElement("td");
    tdName.classList.add("text-center");
    tdName.innerHTML = `<input type="text" class="form-control" id="memberName${id}" value="${name}" maxlength = "50" >`;

    const tdButtonRemove = document.createElement("td");
    // Icon from https://icons.getbootstrap.com/icons/trash/
    tdButtonRemove.innerHTML = `<div class="d-grid gap-2"><button type="button" class="btn btn-warning btn-lg mx-auto" id="memberRemove${id}"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-trash"
    viewBox="0 0 16 16">
    <path
        d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
    <path fill-rule="evenodd"
        d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
</svg></button></div>`;
    trHtml.appendChild(thId);
    trHtml.appendChild(tdName);
    trHtml.appendChild(tdButtonRemove);
    if (toHighlight) {
        trHtml.classList.add("table-primary");
        if (highlightElements.has(trHtml.id)) {
            clearTimeout(highlightElements.get(trHtml.id));
        }
        const timeout = setTimeout(() => {
            const element = document.getElementById(trHtml.id);
            if (element) {
                element.classList.remove("table-primary");
            }
            highlightElements.delete(trHtml.id);
        }, 1000);
        highlightElements.set(trHtml.id, timeout);
    }
    document.getElementById("tbodyMembers").appendChild(trHtml);


    document.getElementById(`memberName${id}`).addEventListener('input', (event) => {
        websocket.send("" + action.modifyToDB + table.member + issueNameRow.name + JSON.stringify([id, event.target.value]));
    });
    document.getElementById(`memberRemove${id}`).addEventListener('click', (event) => {
        const btnMemberRemove = document.getElementById(`memberRemove${id}`);
        btnNewIssue.innerHTML += ' <span class="spinner-border spinner-border-sm" id="spinnerBtnNewIssue" role="status" aria-hidden="true"></span>';
        btnNewIssue.setAttribute("disabled", "");
        websocket.send("" + action.removeToDB + table.member + id);
        // The deletion is performed after the server has accepted it
        // TODO: Need to add an animation if this takes too long
    });
}

function modifyMember(id, value) {
    const elementId = `memberName${id}`;

    document.getElementById(elementId).value = value;

    document.getElementById(elementId).classList.add("bg-info");
    document.getElementById(elementId).classList.add("text-dark");
    if (highlightElements.has(elementId)) {
        clearTimeout(highlightElements.get(elementId));
    }
    const timeout = setTimeout(() => {
        document.getElementById(elementId).classList.remove("bg-info");
        document.getElementById(elementId).classList.remove("text-dark");
        highlightElements.delete(elementId);
    }, 1000);
    highlightElements.set(elementId, timeout);
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
            console.log(event.data);
            let data;
            switch (parseInt(event.data.charAt(0))) {
                case action.init:
                    data = JSON.parse(event.data.substring(1));
                    console.log(data);
                    const membersLst = data[0];
                    const issuesLst = data[1];
                    membersLst.forEach(member => {
                        membersName.set(member[memberNameRow.id], member[memberNameRow.name]);
                        addMember(member[memberNameRow.id], member[memberNameRow.name]);
                    });
                    issuesLst.forEach(issue => {
                        addIssue(issue[issueNameRow.id], issue[issueNameRow.name], issue[issueNameRow.desc], issue[issueNameRow.member]); // TODO: manage case NULL for issue.member_id
                    });
                    break;
                case action.DB_modify:
                    data = JSON.parse(event.data.substring(3));
                    switch (parseInt(event.data.charAt(1))) {
                        case table.member:
                            modifyMember(data[0], data[1]);
                            break;
                        case table.issue:
                            modifyIssue(data[0], parseInt(event.data.charAt(2), 10), data[1]);
                            break;
                        default:
                            break;
                    }
                    break;
                case action.DB_new:
                    const newId = event.data.substring(2);
                    switch (parseInt(event.data.charAt(1))) {
                        case table.member:
                            document.getElementById("btnNewMember").removeAttribute("disabled");
                            const spinnerBtnNewMember = document.getElementById("spinnerBtnNewMember");
                            if (spinnerBtnNewMember) {
                                spinnerBtnNewMember.remove();
                            }
                            addMember(newId, '', true);
                            break;
                        case table.issue:
                            document.getElementById("btnNewIssue").removeAttribute("disabled");
                            const spinnerBtnNewIssue = document.getElementById("spinnerBtnNewIssue");
                            if (spinnerBtnNewIssue) {
                                spinnerBtnNewIssue.remove();
                            }
                            addIssue(newId, '', '', undefined, true);
                            break;
                        default:
                            break;
                    }
                    break;
                case action.DB_remove:
                    const id = event.data.substring(2);
                    switch (parseInt(event.data.charAt(1))) {
                        case table.member:
                            const member = document.getElementById(`memberTr${id}`);
                            if (member) {
                                member.remove();
                            }
                            break;
                        case table.issue:
                            const issue = document.getElementById(`issueTr${id}`);
                            if (issue) {
                                issue.remove();
                            }
                            break;
                        default:
                            break;
                    }
                    break;
                case action.error:
                    switch (parseInt(event.data.charAt(1))) {
                        case error.unableToInit:
                            // TODO: Make a better message
                            alert("Unable to get the first data, please refresh the page.");
                            break;
                        case error.unableToAdd:
                            // TODO: Make a better message
                            switch (parseInt(event.data.charAt(2))) {
                                case table.issue:
                                    alert("Unable to add an issue. Please try again.");
                                    break;
                                case table.member:
                                    alert("Unable to add an member. Please try again.");
                                    break;
                                case table.unknown:
                                default:
                                    alert("Unable to add the data. Please refresh the page.");
                                    break;
                            }
                            break;
                        case error.unableToModify:
                            // TODO: Make a better message
                            switch (parseInt(event.data.charAt(2))) {
                                case table.issue:
                                    alert("Unable to edit an issue. Please refresh the page.");
                                    break;
                                case table.member:
                                    alert("Unable to edit an member. Please refresh the page.");
                                    break;
                                case table.unknown:
                                default:
                                    alert("Unable to edit the data. Please refresh the page.");
                                    break;
                            }
                            break;
                        case error.unableToDelete:
                            // TODO: Make a better message
                            switch (parseInt(event.data.charAt(2))) {
                                // TODO: remove the blocking of the associated buttons
                                case table.issue:
                                    alert("Unable to delete an issue. Please try again.");
                                    break;
                                case table.member:
                                    alert("Unable to delete an member. Please try again.");
                                    break;
                                case table.unknown:
                                default:
                                    alert("Unable to delete the data. Please try again.");
                                    break;
                            }
                            break;
                        case error.deleteMemberAssigned:
                            const memberId = event.data.substring(2);
                            const element = document.getElementById(`memberRemove${memberId}`);
                            // TODO: Make a better message
                            alert("Unable to delete a member whose issues are assigned. Change the issues first.");
                            break;

                        default:
                            break;
                    }
                    break;

                default:
                    console.error("Bad data in websocket");
                    break;
            }



        };
    };
} catch (err) {
    console.error(err);
}

document.getElementById("btnNewIssue").addEventListener('click', (event) => {
    const btnNewIssue = document.getElementById("btnNewIssue");
    btnNewIssue.innerHTML += ' <span class="spinner-border spinner-border-sm" id="spinnerBtnNewIssue" role="status" aria-hidden="true"></span>';
    btnNewIssue.setAttribute("disabled", "");

    websocket.send("" + action.addToDB + table.issue);
    // The addition is done after the server has accepted it
    // TODO: Need to add an animation if this takes too long
});

document.getElementById("btnNewMember").addEventListener('click', (event) => {
    const btnNewMember = document.getElementById("btnNewMember");
    btnNewMember.innerHTML += ' <span class="spinner-border spinner-border-sm" id="spinnerBtnNewMember" role="status" aria-hidden="true"></span>';
    btnNewMember.setAttribute("disabled", "");

    websocket.send("" + action.addToDB + table.member);
    // The addition is done after the server has accepted it
    // TODO: Need to add an animation if this takes too long
});

document.getElementById("btnShowMembers").addEventListener('click', (event) => {
    const btnMembers = document.getElementById("btnShowMembers");
    const btnIssues = document.getElementById("btnShowIssues");

    btnMembers.classList.remove("btn-outline-secondary");
    btnMembers.classList.add("btn-secondary");
    btnIssues.classList.remove("btn-secondary");
    btnIssues.classList.add("btn-outline-secondary");

    document.getElementById("divIssues").style.display = "none";
    document.getElementById("divMembers").style.display = "initial";
});

document.getElementById("btnShowIssues").addEventListener('click', (event) => {
    const btnMembers = document.getElementById("btnShowMembers");
    const btnIssues = document.getElementById("btnShowIssues");

    btnMembers.classList.add("btn-outline-secondary");
    btnMembers.classList.remove("btn-secondary");
    btnIssues.classList.add("btn-secondary");
    btnIssues.classList.remove("btn-outline-secondary");

    document.getElementById("divIssues").style.display = "initial";
    document.getElementById("divMembers").style.display = "none";
});