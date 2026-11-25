// Load saved students (if any) from the browser
let students = [];
try {
    students = JSON.parse(localStorage.getItem("students")) || [];
} catch (e) {
    students = [];
}

let editingId = null;

const nameInput = document.getElementById("name");
const rollInput = document.getElementById("roll");
const courseInput = document.getElementById("course");
const emailInput = document.getElementById("email");
const errorBox = document.getElementById("error");
const searchInput = document.getElementById("search");

function saveToStorage() {
    try {
        localStorage.setItem("students", JSON.stringify(students));
    } catch (e) {
        // Storage not available; the list still works until the page is refreshed
    }
}

function saveStudent() {
    const name = nameInput.value.trim();
    const roll = rollInput.value.trim();
    const course = courseInput.value.trim();
    const email = emailInput.value.trim();

    if (!name || !roll || !course || !email) {
        errorBox.textContent = "Please fill in all fields.";
        return;
    }

    if (!emailInput.checkValidity()) {
        errorBox.textContent = "Please enter a valid email address.";
        return;
    }

    const duplicate = students.some(s => s.roll === roll && s.id !== editingId);
    if (duplicate) {
        errorBox.textContent = "A student with this roll number already exists.";
        return;
    }

    if (editingId === null) {
        students.push({ id: Date.now(), name, roll, course, email });
    } else {
        const s = students.find(s => s.id === editingId);
        s.name = name;
        s.roll = roll;
        s.course = course;
        s.email = email;
    }

    saveToStorage();
    resetForm();
    render();
}

function editStudent(id) {
    const s = students.find(s => s.id === id);
    editingId = id;
    nameInput.value = s.name;
    rollInput.value = s.roll;
    courseInput.value = s.course;
    emailInput.value = s.email;

    document.getElementById("formTitle").textContent = "Edit student";
    document.getElementById("saveBtn").textContent = "Save changes";
    document.getElementById("cancelBtn").hidden = false;
    errorBox.textContent = "";
    nameInput.focus();
}

function deleteStudent(id) {
    if (!confirm("Delete this student?")) return;
    students = students.filter(s => s.id !== id);
    if (editingId === id) resetForm();
    saveToStorage();
    render();
}

function resetForm() {
    editingId = null;
    nameInput.value = "";
    rollInput.value = "";
    courseInput.value = "";
    emailInput.value = "";
    errorBox.textContent = "";
    document.getElementById("formTitle").textContent = "Add student";
    document.getElementById("saveBtn").textContent = "Add student";
    document.getElementById("cancelBtn").hidden = true;
}

function render() {
    const query = searchInput.value.trim().toLowerCase();
    const body = document.getElementById("tableBody");
    body.innerHTML = "";

    const shown = students.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.roll.toLowerCase().includes(query)
    );

    shown.forEach(s => {
        const tr = document.createElement("tr");

        [s.roll, s.name, s.course, s.email].forEach(text => {
            const td = document.createElement("td");
            td.textContent = text;
            tr.appendChild(td);
        });

        const actions = document.createElement("td");

        const edit = document.createElement("button");
        edit.className = "edit";
        edit.textContent = "Edit";
        edit.onclick = () => editStudent(s.id);

        const del = document.createElement("button");
        del.className = "delete";
        del.textContent = "Delete";
        del.onclick = () => deleteStudent(s.id);

        actions.append(edit, del);
        tr.appendChild(actions);
        body.appendChild(tr);
    });

    const empty = document.getElementById("empty");
    empty.hidden = shown.length > 0;
    empty.textContent = students.length === 0
        ? "No students yet. Add one using the form."
        : "No students match your search.";

    document.getElementById("total").textContent =
        students.length + (students.length === 1 ? " student" : " students");
}

searchInput.addEventListener("input", render);
document.getElementById("studentForm").addEventListener("keydown", e => {
    if (e.key === "Enter") saveStudent();
});

render();
