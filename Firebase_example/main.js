firebase.initializeApp(firebaseConfig);
var database = firebase.database();

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
            selectAssigned.innerHTML += `<option idmember="${id}" selected>${name}</option>`;
        else
            selectAssigned.innerHTML += `<option idmember="${id}">${name}</option>`;
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
        database.ref(table.issue + '/' + id + "/" + issueNameRow.name).set(event.target.value);
    });
    document.getElementById(`issueDescription${id}`).addEventListener('input', (event) => {
        database.ref(table.issue + '/' + id + "/" + issueNameRow.desc).set(event.target.value);
    });
    document.getElementById(`issueAssignedTo${id}`).addEventListener('input', (event) => {
        let idMember;
        membersName.forEach((name, id) => {
            if (event.target.value === name) {
                idMember = id;
            }
        });
        database.ref(table.issue + '/' + id + "/" + issueNameRow.member).set(idMember ? idMember : -1);
    });
    document.getElementById(`issueRemove${id}`).addEventListener('click', (event) => {
        const btnIssueRemove = document.getElementById(`issueRemove${id}`);
        btnIssueRemove.innerHTML += ` <span class="spinner-border spinner-border-sm" id="spinnerBtnRemoveMember${id}" role="status" aria-hidden="true"></span>`;
        btnIssueRemove.setAttribute("disabled", "");
        database.ref(table.issue + '/' + id).remove();
        // The deletion is performed after the server has accepted it
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
        const options = document.getElementById(elementId).options;
        options[0].selected = 'selected';
        Array.from(options).forEach(option => {
            if (option.getAttribute("idmember") === value) {
                option.selected = 'selected';
            }
        });
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
    if (toHighlight) { // This means that it is a new member, so update all "select member" in the issue view.
        // There may be a better way to get all this, but for this demo, it's enough.
        const selectsInDOM = Array.from(document.querySelectorAll("select")).filter(select => select.id.startsWith("issueAssignedTo"));
        selectsInDOM.forEach(select => {
            select.innerHTML += `<option idmember="${id}">${name}</option>`;
        });
    }

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
        modifyMember(id, event.target.value);
        database.ref(table.member + '/' + id).set({
            [memberNameRow.name]: event.target.value
        });
    });
    document.getElementById(`memberRemove${id}`).addEventListener('click', (event) => {
        const btnMemberRemove = document.getElementById(`memberRemove${id}`);
        btnMemberRemove.innerHTML += ` <span class="spinner-border spinner-border-sm" id="spinnerBtnRemoveMember${id}" role="status" aria-hidden="true"></span>`;
        btnMemberRemove.setAttribute("disabled", "");
        database.ref(table.member + '/' + id).remove();
        // The deletion is performed after the server has accepted it
        // TODO: Need to add an animation if this takes too long
    });
}

function modifyMember(id, name, toHighlight = false) {
    const elementId = `memberName${id}`;
    document.getElementById(elementId).value = name;
    membersName.set(id, name);

    // There may be a better way to get all this, but for this demo, it's enough.
    document.querySelectorAll("option").forEach(option => {
        if (option.getAttribute("idmember") == id) {
            option.innerHTML = name;
        }
    });

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

const initPromise = [];
const lstIssueToGetEvent = [];
initPromise.push(database.ref("" + table.member).once('value', (snapshot) => {
    const allData = snapshot.val();
    for (const [key, value] of Object.entries(allData)) {
        membersName.set(key, value[memberNameRow.name]);
        addMember(key, value[memberNameRow.name]);
    }

}));
initPromise.push(database.ref("" + table.issue).once('value', (snapshot) => {
    const allData = snapshot.val();
    for (const [key, value] of Object.entries(allData)) {
        lstIssueToGetEvent.push(key);
        addIssue(key, value[issueNameRow.name], value[issueNameRow.desc], value[issueNameRow.member]);
    }
}));
Promise.all(initPromise).then(() => {
    database.ref("" + table.member).on('child_added', (snapshot) => {
        const data = snapshot.val();
        if (!membersName.has(snapshot.key)) {
            document.getElementById("btnNewMember").removeAttribute("disabled");
            const spinnerBtnNewMember = document.getElementById("spinnerBtnNewMember");
            if (spinnerBtnNewMember) {
                spinnerBtnNewMember.remove();
            }
            membersName.set(snapshot.key, data[memberNameRow.name]);
            addMember(snapshot.key, data[memberNameRow.name], true);
        }
    });
    database.ref("" + table.issue).on('child_added', (snapshot) => {
        const data = snapshot.val();
        const issueId = snapshot.key;
        if (!document.getElementById(`issueId${issueId}`)) {
            document.getElementById("btnNewIssue").removeAttribute("disabled");
            const spinnerBtnNewIssue = document.getElementById("spinnerBtnNewIssue");
            if (spinnerBtnNewIssue) {
                spinnerBtnNewIssue.remove();
            }
            addIssue(issueId, data[issueNameRow.name], data[issueNameRow.desc], data[issueNameRow.member], true);
        }
        database.ref("" + table.issue + "/" + issueId).on('child_changed', (snapshot) => {
            const data = snapshot.val();
            modifyIssue(issueId, parseInt(snapshot.key), data);
        });
    });

    database.ref("" + table.member).on('child_changed', (snapshot) => {
        const data = snapshot.val();
        modifyMember(snapshot.key, data[memberNameRow.name], true);
    });

    lstIssueToGetEvent.forEach(issueId => {
        database.ref("" + table.issue + "/" + issueId).on('child_changed', (snapshot) => {
            const data = snapshot.val();
            modifyIssue(issueId, parseInt(snapshot.key), data);
        });
    });
    database.ref("" + table.member).on('child_removed', (snapshot) => {
        const id = snapshot.key;
        const member = document.getElementById(`memberTr${id}`);
        if (member) {
            member.remove();
        }

        // There may be a better way to get all this, but for this demo, it's enough.
        const selectsInDOM = Array.from(document.querySelectorAll("select")).filter(select => select.id.startsWith("issueAssignedTo"));
        selectsInDOM.forEach(select => {
            const startIndex = select.innerHTML.indexOf(`<option idmember="${id}">`);
            if (startIndex != -1) {
                const endIndex = select.innerHTML.indexOf(`</option>`, startIndex) + "</option>".length;
                select.innerHTML = select.innerHTML.substring(0, startIndex) + select.innerHTML.substring(endIndex);
            }
        });
    });
    database.ref("" + table.issue).on('child_removed', (snapshot) => {
        const id = snapshot.key;
        const issue = document.getElementById(`issueTr${id}`);
        if (issue) {
            issue.remove();
        }
    });
}).catch(error => {
    // TODO: Make a better message
    alert("Unable to initialize data, please refresh the page.");
});


document.getElementById("btnNewIssue").addEventListener('click', (event) => {
    const btnNewIssue = document.getElementById("btnNewIssue");
    btnNewIssue.innerHTML += ' <span class="spinner-border spinner-border-sm" id="spinnerBtnNewIssue" role="status" aria-hidden="true"></span>';
    btnNewIssue.setAttribute("disabled", "");

    const id = database.ref("" + table.member).push().key;
    database.ref(table.issue + '/' + id).set({
        [issueNameRow.name]: "",
        [issueNameRow.desc]: "",
        [issueNameRow.member]: -1
    });
    // The addition is done after Firebase has accepted it
});

document.getElementById("btnNewMember").addEventListener('click', (event) => {
    const btnNewMember = document.getElementById("btnNewMember");
    btnNewMember.innerHTML += ' <span class="spinner-border spinner-border-sm" id="spinnerBtnNewMember" role="status" aria-hidden="true"></span>';
    btnNewMember.setAttribute("disabled", "");

    const id = database.ref("" + table.member).push().key;
    database.ref(table.member + '/' + id).set({
        [memberNameRow.name]: ""
    });
    // The addition is done after Firebase has accepted it
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