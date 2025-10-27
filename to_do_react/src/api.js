const API_BASE = "http://localhost:8000/api/v1/todos";

// Get all todos with pagination
export async function getTodos(skip = 0, limit = 10) {
  try {
    const response = await fetch(`${API_BASE}?skip=${skip}&limit=${limit}`);
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`❌ HTTP ${response.status}: ${text}`);
    }
    const data = await response.json();
    return data; // { total, items }
  } catch (err) {
    console.error("❌ getTodos failed:", err);
    throw err;
  }
}

// Get completed todos
export async function getCompletedTodos() {
  const url = `${API_BASE}/filter/completed`; // no skip/limit
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`❌ HTTP ${response.status}: ${text}`);
    }
    const data = await response.json();
    return response.json(); // array
  } catch (err) {
    console.error("❌ getCompletedTodos failed:", err);
    throw err;
  }
}

// Get pending todos
export async function getPendingTodos() {
  const url = `${API_BASE}/filter/pending`; // no skip/limit
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`❌ HTTP ${response.status}: ${text}`);
    }
    const data = await response.json();
    return response.json(); // array
  } catch (err) {
    console.error("❌ getPendingTodos failed:", err);
    throw err;
  }
}


// Add a new todo
export async function addTodo(todo) {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(todo),
  });
  return response.json();
}

// Update a todo
export async function updateTodo(id, todo) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(todo),
  });
  return response.json();
}

// Delete a todo
export async function deleteTodo(id) {
  await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
}
