
function handleStudentIDField() {
    const ticketType = document.getElementById("ticketType").value;
    const studentIDSection = document.getElementById("studentIDCardSection");

    if (ticketType === "student") {
        studentIDSection.classList.remove("hidden");
    } else {
        studentIDSection.classList.add("hidden");
    }
}