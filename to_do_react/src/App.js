import React, { useState, useEffect } from "react";

const API_BASE = "http://localhost:8000/api/v1/todos";

function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [errors, setErrors] = useState("");

  useEffect(() => {
    const fetchTodos = async () => {
      const skip = (page - 1) * limit;
      let url = `${API_BASE}?skip=${skip}&limit=${limit}`;

      if (filter === "completed")
        url = `${API_BASE}/filter/completed?skip=${skip}&limit=${limit}`;
      else if (filter === "pending")
        url = `${API_BASE}/filter/pending?skip=${skip}&limit=${limit}`;

      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setTodos(data.items);
        setTotal(data.total);
      } catch (err) {
        console.error("❌ Error fetching todos:", err);
      }
    };

    fetchTodos();
  }, [filter, page, limit]);

  // --- Add new todo ---
  const addTodoToAPI = async ({ title, description }) => {
    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, is_completed: false }),
      });
      if (!res.ok) throw new Error("Failed to add todo");
  
      setTitle("");
      setDescription("");
      setPage(1);
    } catch (err) {
      console.error("❌ Error adding todo:", err);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    let newErrors = { title: "", description: "" };
    if (!title.trim()) newErrors.title = "Enter title";
    if (!description.trim()) newErrors.description = "Enter description";
  
    if (newErrors.title || newErrors.description) {
      setErrors(newErrors);
      return;
    }
  
    // ✅ call helper without event
    setErrors({ title: "", description: "" });
    await addTodoToAPI({ title, description });
  };
  

  const handleToggleComplete = async (todo) => {
    try {
      const res = await fetch(`${API_BASE}/${todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...todo, is_completed: !todo.is_completed }),
      });
      if (!res.ok) throw new Error("Failed to toggle todo");

      const skip = (page - 1) * limit;
      let url = `${API_BASE}?skip=${skip}&limit=${limit}`;
      if (filter === "completed")
        url = `${API_BASE}/filter/completed?skip=${skip}&limit=${limit}`;
      else if (filter === "pending")
        url = `${API_BASE}/filter/pending?skip=${skip}&limit=${limit}`;

      const refreshed = await fetch(url);
      const data = await refreshed.json();
      setTodos(data.items);
      setTotal(data.total);
    } catch (err) {
      console.error("❌ Error toggling todo:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this todo?")) return;

    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete todo");

      const skip = (page - 1) * limit;
      let url = `${API_BASE}?skip=${skip}&limit=${limit}`;
      if (filter === "completed")
        url = `${API_BASE}/filter/completed?skip=${skip}&limit=${limit}`;
      else if (filter === "pending")
        url = `${API_BASE}/filter/pending?skip=${skip}&limit=${limit}`;

      const refreshed = await fetch(url);
      const data = await refreshed.json();
      setTodos(data.items);
      setTotal(data.total);
    } catch (err) {
      console.error("❌ Error deleting todo:", err);
    }
  };

  const maxPage = Math.ceil(total / limit) || 1;



  return (
    <div style={styles.container}>
      <style>
        {`
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-thumb {
            background-color: #007bff;
            border-radius: 4px;
          }
          ::-webkit-scrollbar-thumb:hover { background-color: #0056b3; }
        `}
      </style>

      <h1 style={styles.header}>📝 Todo List</h1>

      {/* Add Todo Form */}
      <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.inputGroup}>
        <input
          type="text"
          placeholder="Enter title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors({ ...errors, title: "" });
          }}
          style={{
            ...styles.input,
            ...(errors.title ? styles.inputError : {}),
          }}
        />
        {errors.title && <span style={styles.errorText}>{errors.title}</span>}
      </div>

      <div style={styles.inputGroup}>
        <input
          type="text"
          placeholder="Enter description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (errors.description) setErrors({ ...errors, description: "" });
          }}
          style={{
            ...styles.input,
            ...(errors.description ? styles.inputError : {}),
          }}
        />
        {errors.description && (
          <span style={styles.errorText}>{errors.description}</span>
        )}
      </div>

      <button type="submit" style={styles.addButton}>
        ➕ Add
      </button>
    </form>



      {/* Filter Buttons */}
      <div style={styles.filterContainer}>
        {["all", "completed", "pending"].map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1); }}
            style={{
              ...styles.filterButton,
              backgroundColor: filter === f ? "#007bff" : "#e9ecef",
              color: filter === f ? "white" : "#333",
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Todo Table */}
      <div style={styles.todoTableContainer}>
        <table style={styles.todoTable}>
          <thead style={styles.tableHeader}>
            <tr>
              <th style={styles.th}>#</th>
              <th style={styles.th}>Title</th>
              <th style={styles.th}>Description</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {todos.length === 0 ? (
              <tr>
                <td colSpan="5" style={styles.emptyCell}>No todos found.</td>
              </tr>
            ) : (
              todos.map((todo, index) => (
                <tr key={todo.id} style={styles.tr}>
                  <td style={styles.td}>{(page - 1) * limit + index + 1}</td>
                  <td
                    style={{
                      ...styles.td,
                      textDecoration: todo.is_completed ? "line-through" : "none",
                      color: todo.is_completed ? "#999" : "#333",
                    }}
                  >
                    {todo.title}
                  </td>
                  <td style={styles.td}>{todo.description}</td>
                  <td style={styles.td}>
                    {todo.is_completed ? (
                      <span style={{ color: "#28a745", fontWeight: "bold" }}>
                        ✅ Completed
                      </span>
                    ) : (
                      <span style={{ color: "#f0ad4e", fontWeight: "bold" }}>
                        ⏳ Pending
                      </span>
                    )}
                  </td>
                  <td style={styles.td}>
                    <button
                      onClick={() => handleToggleComplete(todo)}
                      style={{
                        ...styles.smallButton,
                        backgroundColor: todo.is_completed ? "#ffc107" : "#28a745",
                      }}
                    >
                      {todo.is_completed ? "Undo" : "Done"}
                    </button>
                    <button
                      onClick={() => handleDelete(todo.id)}
                      style={{
                        ...styles.smallButton,
                        backgroundColor: "#dc3545",
                        marginLeft: "6px",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={styles.pagination}>
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          style={styles.pageButton}
        >
          ⬅ Prev
        </button>
        <span style={styles.pageInfo}>
          Page {page} / {maxPage}
        </span>
        <button
          onClick={() => setPage((prev) => (prev < maxPage ? prev + 1 : prev))}
          disabled={page >= maxPage}
          style={styles.pageButton}
        >
          Next ➡
        </button>
      </div>
    </div>
  );
}


export default App;

// --------------------------
// Styles
// --------------------------
const styles = {
  container: {
    width: "100vw",            // full screen width
    height: "100vh",           // full screen height
    margin: 0,
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    background: "linear-gradient(135deg, #fbc2eb, #a18cd1)",
    color: "white", // make text visible on dark background
  },
  header: {
    textAlign: "center",
    color: "#007bff",
    fontSize: "32px",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  inputError: {
    border: "2px solid #d93025",
  },
  errorText: {
    color: "#d93025",
    fontSize: "11px",
    marginTop: "0px",
    marginBottom: "5px",
  },
  addButton: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "10px 16px",
    cursor: "pointer",
  },
  filterContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "15px",
  },
  filterButton: {
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  todoTableContainer: {
    maxHeight: "400px",
    overflowY: "auto",
    marginTop: "20px",
    marginBottom: "20px",
    borderRadius: "10px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  todoTable: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "600px",
  },
  tableHeader: {
    position: "sticky",
    top: 0,
    backgroundColor: "#007bff",
    color: "white",
    zIndex: 1,
  },
  th: {
    padding: "12px",
    textAlign: "left",
    fontWeight: "bold",
    borderBottom: "2px solid #ddd",
  },
  td: {
    padding: "10px",
    borderBottom: "1px solid #eee",
    verticalAlign: "top",
  },
  tr: {
    transition: "background 0.2s ease",
  },
  emptyCell: {
    textAlign: "center",
    padding: "40px",
    color: "#888",
  },
  smallButton: {
    border: "none",
    borderRadius: "6px",
    color: "white",
    padding: "6px 10px",
    cursor: "pointer",
    fontSize: "13px",
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    marginTop: "10px",
  },
  pageButton: {
    padding: "8px 14px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#007bff",
    color: "white",
    cursor: "pointer",
  },
  pageInfo: {
    fontWeight: "bold",
  },
};