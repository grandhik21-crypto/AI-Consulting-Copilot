const API_URL = "/ask";

const askForm = document.getElementById("ask-form");
const questionInput = document.getElementById("question-input");
const askButton = document.getElementById("ask-button");
const conversation = document.getElementById("conversation");

function clearEmptyState() {
  const emptyState = conversation.querySelector(".conversation-empty");
  if (emptyState) {
    emptyState.remove();
  }
}

function addMessage(text, type) {
  clearEmptyState();

  const message = document.createElement("div");
  message.className = `message message-${type}`;

  const label = document.createElement("span");
  label.className = "message-label";
  label.textContent = type === "user" ? "You" : "Wikipedia";

  const content = document.createElement("p");
  content.style.margin = "0";
  content.textContent = text;

  message.append(label, content);
  conversation.appendChild(message);
  conversation.scrollTop = conversation.scrollHeight;
}

function addErrorMessage(text) {
  clearEmptyState();

  const message = document.createElement("div");
  message.className = "message message-error";
  message.textContent = text;
  conversation.appendChild(message);
  conversation.scrollTop = conversation.scrollHeight;
}

function setLoading(isLoading) {
  askButton.disabled = isLoading;
  questionInput.disabled = isLoading;
  askButton.textContent = isLoading ? "Asking..." : "Ask";
}

async function askQuestion(question) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.answer;
}

askForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const question = questionInput.value.trim();
  if (!question) {
    return;
  }

  addMessage(question, "user");
  questionInput.value = "";
  setLoading(true);

  try {
    const answer = await askQuestion(question);
    addMessage(answer, "bot");
  } catch (error) {
    addErrorMessage(
      "Could not reach the server. Make sure FastAPI is running and try again."
    );
    console.error(error);
  } finally {
    setLoading(false);
    questionInput.focus();
  }
});
