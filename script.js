/* =================================
   EVENT MANAGEMENT SYSTEM
   CRUD + LOCAL STORAGE
================================= */


// ================================
// DOM ELEMENTS
// ================================

const eventForm = document.getElementById("eventForm");

const eventIdInput = document.getElementById("eventId");

const eventTitleInput = document.getElementById("eventTitle");

const createdDateInput = document.getElementById("createdDate");

const eventDateInput = document.getElementById("eventDate");

const descriptionInput = document.getElementById("description");

const eventTypeInput = document.getElementById("eventType");

const eventsContainer = document.getElementById("eventsContainer");

const emptyState = document.getElementById("emptyState");

const eventCount = document.getElementById("eventCount");

const formHeading = document.getElementById("formHeading");

const submitButton = document.getElementById("submitButton");

const cancelButton = document.getElementById("cancelButton");

const eventModal = document.getElementById("eventModal");

const modalBody = document.getElementById("modalBody");

const modalClose = document.getElementById("modalClose");


// ================================
// LOCAL STORAGE KEY
// ================================

const STORAGE_KEY = "eventManagementSystem";


// ================================
// GET EVENTS FROM LOCAL STORAGE
// ================================

function getEvents() {

    const events = localStorage.getItem(STORAGE_KEY);

    if (!events) {
        return [];
    }

    try {
        return JSON.parse(events);
    } catch (error) {
        console.error("Error reading events:", error);
        return [];
    }
}


// ================================
// SAVE EVENTS TO LOCAL STORAGE
// ================================

function saveEvents(events) {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(events)
    );
}


// ================================
// GENERATE UNIQUE ID
// ================================

function generateId() {

    return Date.now().toString();
}


// ================================
// FORMAT DATE
// ================================

function formatDate(dateString) {

    if (!dateString) {
        return "";
    }

    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}


// ================================
// ESCAPE HTML
// Security helper
// ================================

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// ================================
// DISPLAY EVENTS
// READ OPERATION
// ================================

function displayEvents() {

    const events = getEvents();

    eventsContainer.innerHTML = "";

    eventCount.textContent =
        `${events.length} ${events.length === 1 ? "event" : "events"}`;


    if (events.length === 0) {

        emptyState.classList.remove("hidden");

        return;
    }


    emptyState.classList.add("hidden");


    // Newest events first
    events.sort((a, b) => b.id - a.id);


    events.forEach(event => {

        const card = document.createElement("div");

        card.className = "event-card";


        card.innerHTML = `

            <div class="event-card-header">

                <h3>
                    ${escapeHTML(event.title)}
                </h3>

                <span class="event-type">
                    ${escapeHTML(event.type)}
                </span>

            </div>


            <div class="event-card-body">

                <div class="event-date">
                    📅 ${formatDate(event.eventDate)}
                </div>

                <div class="event-created">
                    Created:
                    ${formatDate(event.createdDate)}
                </div>

                <div class="event-description">
                    ${escapeHTML(event.description)}
                </div>


                <div class="card-buttons">

                    <button
                        class="btn-view"
                        onclick="viewEvent('${event.id}', event)"
                    >
                        View
                    </button>

                    <button
                        class="btn-edit"
                        onclick="editEvent('${event.id}', event)"
                    >
                        Edit
                    </button>

                    <button
                        class="btn-delete"
                        onclick="deleteEvent('${event.id}', event)"
                    >
                        Delete
                    </button>

                </div>

            </div>
        `;


        // Clicking the card itself
        card.addEventListener("click", function () {

            viewEvent(event.id);

        });


        eventsContainer.appendChild(card);

    });
}


// ================================
// CREATE EVENT
// ================================

eventForm.addEventListener("submit", function (e) {

    e.preventDefault();


    // Get form values
    const title = eventTitleInput.value.trim();

    const createdDate = createdDateInput.value;

    const eventDate = eventDateInput.value;

    const description = descriptionInput.value.trim();

    const type = eventTypeInput.value;


    // ============================
    // VALIDATION
    // ============================

    if (!title) {

        alert("Please enter an event title.");

        eventTitleInput.focus();

        return;
    }


    if (!createdDate) {

        alert("Please select the created date.");

        createdDateInput.focus();

        return;
    }


    if (!eventDate) {

        alert("Please select the event date.");

        eventDateInput.focus();

        return;
    }


    if (!type) {

        alert("Please select an event type.");

        eventTypeInput.focus();

        return;
    }


    if (!description) {

        alert("Please enter an event description.");

        descriptionInput.focus();

        return;
    }


    // Event date cannot be before created date
    if (eventDate < createdDate) {

        alert(
            "Event date cannot be earlier than the created date."
        );

        eventDateInput.focus();

        return;
    }


    // ============================
    // CHECK EDIT OR CREATE
    // ============================

    const editingId = eventIdInput.value;


    if (editingId) {

        // ========================
        // UPDATE OPERATION
        // ========================

        updateEvent(
            editingId,
            title,
            createdDate,
            eventDate,
            description,
            type
        );

    } else {

        // ========================
        // CREATE OPERATION
        // ========================

        const newEvent = {

            id: generateId(),

            title: title,

            createdDate: createdDate,

            eventDate: eventDate,

            description: description,

            type: type

        };


        const events = getEvents();

        events.push(newEvent);

        saveEvents(events);


        alert("Event added successfully!");

    }


    resetForm();

    displayEvents();

});


// ================================
// UPDATE EVENT
// ================================

function updateEvent(
    id,
    title,
    createdDate,
    eventDate,
    description,
    type
) {

    const events = getEvents();

    const eventIndex = events.findIndex(
        event => event.id === id
    );


    if (eventIndex === -1) {

        alert("Event not found.");

        return;
    }


    events[eventIndex] = {

        id: id,

        title: title,

        createdDate: createdDate,

        eventDate: eventDate,

        description: description,

        type: type

    };


    saveEvents(events);


    alert("Event updated successfully!");

}


// ================================
// VIEW EVENT
// ================================

function viewEvent(id, event) {

    // Stop card click event
    if (event) {
        event.stopPropagation();
    }


    const events = getEvents();

    const selectedEvent = events.find(
        eventItem => eventItem.id === id
    );


    if (!selectedEvent) {

        alert("Event not found.");

        return;
    }


    modalBody.innerHTML = `

        <h2 class="modal-title">
            ${escapeHTML(selectedEvent.title)}
        </h2>


        <div class="detail-item">

            <span class="detail-label">
                Event Type
            </span>

            <span class="detail-value">
                ${escapeHTML(selectedEvent.type)}
            </span>

        </div>


        <div class="detail-item">

            <span class="detail-label">
                Created Date
            </span>

            <span class="detail-value">
                ${formatDate(selectedEvent.createdDate)}
            </span>

        </div>


        <div class="detail-item">

            <span class="detail-label">
                Event Date
            </span>

            <span class="detail-value">
                ${formatDate(selectedEvent.eventDate)}
            </span>

        </div>


        <div class="detail-item">

            <span class="detail-label">
                Description
            </span>

            <div class="detail-value">
                ${escapeHTML(selectedEvent.description)}
            </div>

        </div>

    `;


    eventModal.classList.add("active");
}


// ================================
// EDIT EVENT
// ================================

function editEvent(id, event) {

    // Stop card click event
    if (event) {
        event.stopPropagation();
    }


    const events = getEvents();

    const selectedEvent = events.find(
        eventItem => eventItem.id === id
    );


    if (!selectedEvent) {

        alert("Event not found.");

        return;
    }


    // Fill form
    eventIdInput.value = selectedEvent.id;

    eventTitleInput.value = selectedEvent.title;

    createdDateInput.value = selectedEvent.createdDate;

    eventDateInput.value = selectedEvent.eventDate;

    descriptionInput.value = selectedEvent.description;

    eventTypeInput.value = selectedEvent.type;


    // Change form appearance
    formHeading.textContent = "Edit Event";

    submitButton.textContent = "Update Event";

    cancelButton.classList.remove("hidden");


    // Scroll to form
    document.querySelector(".form-section")
        .scrollIntoView({
            behavior: "smooth"
        });

}


// ================================
// DELETE EVENT
// ================================

function deleteEvent(id, event) {

    // Stop card click event
    if (event) {
        event.stopPropagation();
    }


    const events = getEvents();

    const selectedEvent = events.find(
        eventItem => eventItem.id === id
    );


    if (!selectedEvent) {

        alert("Event not found.");

        return;
    }


    // Confirmation
    const confirmed = confirm(
        `Are you sure you want to delete "${selectedEvent.title}"?`
    );


    if (!confirmed) {
        return;
    }


    const updatedEvents = events.filter(
        eventItem => eventItem.id !== id
    );


    saveEvents(updatedEvents);


    alert("Event deleted successfully!");


    displayEvents();
}


// ================================
// RESET FORM
// ================================

function resetForm() {

    eventForm.reset();

    eventIdInput.value = "";

    formHeading.textContent = "Add New Event";

    submitButton.textContent = "Add Event";

    cancelButton.classList.add("hidden");

    setDefaultCreatedDate();
}


// ================================
// CANCEL EDIT
// ================================

cancelButton.addEventListener(
    "click",
    function () {

        resetForm();

    }
);


// ================================
// CLOSE MODAL
// ================================

modalClose.addEventListener(
    "click",
    function () {

        eventModal.classList.remove("active");

    }
);


// ================================
// CLOSE MODAL WHEN CLICKING
// OUTSIDE CONTENT
// ================================

eventModal.addEventListener(
    "click",
    function (e) {

        if (e.target === eventModal) {

            eventModal.classList.remove("active");

        }

    }
);


// ================================
// ESC KEY CLOSE MODAL
// ================================

document.addEventListener(
    "keydown",
    function (e) {

        if (e.key === "Escape") {

            eventModal.classList.remove("active");

        }

    }
);


// ================================
// SET TODAY AS CREATED DATE
// ================================

function setDefaultCreatedDate() {

    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");


    createdDateInput.value =
        `${year}-${month}-${day}`;
}


// ================================
// INITIALIZE APPLICATION
// ================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        setDefaultCreatedDate();

        displayEvents();

    }
);