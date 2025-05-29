import { z } from "zod";

// Global var declaration
const API_URL = "http://localhost:3000";

// Hide the form initially
const form = document.querySelector("#add-card-form");
const modalForm = document.querySelector(".modal_form");
modalForm.style.display = "none";

// Zod schema for later validation
const schema = z.object({
  title: z.string().min(1, "Name is required"),
  description: z.string(),
  id: z.string().min(1),
  status: z.string().min(1, "Status is required"),
  priority: z.string().optional(),
  date: z.string().optional(),
  responsible: z.string().optional().nullable(),
});

// ### CRUD
//  GET all cards from API
async function fetchCards() {
  try {
    const response = await fetch(`${API_URL}/cards`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const cards = await response.json();
    return cards;
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
}

// POST a card
// Helper to format date to DD-MM-YYYY
function formatDateToDDMMYYYY(dateStr) {
  const date = dateStr ? new Date(dateStr) : new Date();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

// POST METHOD
async function postCard(card) {
  const uuid = crypto.randomUUID();
  const formattedDate = formatDateToDDMMYYYY(card["due-date"]);
  const formattedPriority =
    card.priority && card.priority.length > 0
      ? card.priority.charAt(0).toUpperCase() +
        card.priority.slice(1).toLowerCase()
      : "High";
  const payload = {
    ...card,
    id: uuid,
    date: formattedDate,
    status: card.status || "to-do",
    priority: formattedPriority,
    responsible: card.responsible || null,
  };

  try {
    const isValid = schema.safeParse({ ...payload });
    console.log(isValid, "is valid");

    if (!isValid.success) {
      console.log(isValid.error);
      alert("object is not valid");
      return;
    }

    const response = await fetch(`${API_URL}/cards`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const cards = await response.json();
    console.log(cards);
    renderCards(cards);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }
}


// DELETE METHOD
async function deleteCard(id) {
  try {
    const response = await fetch(`${API_URL}/cards/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    await renderCards();
  } catch (error) {
    console.error("Error deleting card:", error);
  }
}

// PATCH METHOD
async function updateCard(id, card) {
  // Format date and priority as in postCard
  const formattedDate = formatDateToDDMMYYYY(card["due-date"]);
  const formattedPriority =
    card.priority && card.priority.length > 0
      ? card.priority.charAt(0).toUpperCase() + card.priority.slice(1).toLowerCase()
      : "High";
  const payload = {
    ...card,
    date: formattedDate,
    priority: formattedPriority,
    responsible: card.responsible || null,
  };

  try {
    const response = await fetch(`${API_URL}/cards/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    await renderCards();
  } catch (error) {
    console.error("Error updating card:", error);
  }
}

async function renderCards() {
  const todoCont = document.querySelector("#todo-list");
  const inProgressCont = document.querySelector("#in-progress-list");
  const doneCont = document.querySelector("#done-list");

  // Clear containers before rendering
  todoCont.innerHTML = "";
  inProgressCont.innerHTML = "";
  doneCont.innerHTML = "";

  const cards = await fetchCards();

  const todoList = cards
    .filter((c) => c.status === "to-do")
    .map(cardTemplate)
    .join("");
  const inProgressList = cards
    .filter((c) => c.status === "in-progress")
    .map(cardTemplate)
    .join("");
  const doneList = cards
    .filter((c) => c.status === "done")
    .map(cardTemplate)
    .join("");

  todoCont.innerHTML = todoList;
  inProgressCont.innerHTML = inProgressList;
  doneCont.innerHTML = doneList;

  const deleteBtn = document.querySelectorAll("#delete-card");
  for (const card_d of deleteBtn) {
    card_d?.addEventListener("click", async (event) => {
      const cardID = card_d.getAttribute("data");
      console.log(cardID);
      await deleteCard(cardID);
    });
  }

  const editBtns = document.querySelectorAll("#edit-card");
  for (const editBtn of editBtns) {
    editBtn.addEventListener("click", async (event) => {
      const cardID = editBtn.getAttribute("data");
      const cards = await fetchCards();
      const card = cards.find((c) => c.id === cardID);
      if (card) {
        // Fill the form with card data
        form.title.value = card.title || "";
        form.description.value = card.description || "";
        form["due-date"].value = card["due-date"] || ""; // fallback if you store due-date
        form.priority.value = card.priority
          ? card.priority.toLowerCase()
          : "high";
        form.status.value = card.status || "to-do";
        // Show the form below the card
        const cardElem = document.getElementById(cardID);
        cardElem.insertAdjacentElement("afterend", modalForm);
        modalForm.style.display = "flex";
        modalForm.style.marginBottom = "1rem";
        // Store the editing card id
        form.setAttribute("data-editing", cardID);
      }
    });
  }
}

function cardTemplate(card) {
  return `<div class="card" id="${card?.id}">
    <div class="card-header">
      <div class="card-title">${card?.title}</div>
      <div class="card-actions"">
        <span data="${card.id}" id="edit-card" title="Edit"">✏️</span>
        <span data="${card.id}" id="delete-card" title="Delete"">🗑️</span>
      </div>
    </div>
    <div class="card-description">
      ${card?.description || ""}
    </div>
    <div class="card-meta">
      <div class="card-stats">
        <span>📅 ${card.date}</span>
        <span>🚩 ${card.priority || "High"}</span>
      </div>
      <div class="card-assignees">
        <div class="avatar">${
          card.responsible ? card.responsible[0] : "?"
        }</div>
      </div>
    </div>
  </div>`;
}

// Show form below the clicked .add-card button
document.querySelectorAll(".add-card").forEach((btn) => {
  btn.addEventListener("click", function (e) {
    // Move the form below the clicked .add-card
    btn.insertAdjacentElement("afterend", modalForm);
    modalForm.style.display = "flex";
    modalForm.style.marginBottom = "1rem";
    // Optionally, scroll into view
    modalForm.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// Hide form after submit
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const card = Object.fromEntries(formData.entries());
  const editingId = form.getAttribute("data-editing");

  if (editingId) {
    // Edit mode: send PATCH/PUT
    await updateCard(editingId, card);
    form.removeAttribute("data-editing");
  } else {
    // Create mode
    await postCard(card);
  }
  modalForm.style.display = "none";
  form.reset();
});

renderCards();
