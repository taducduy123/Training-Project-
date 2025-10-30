import React, { useEffect, useState } from "react";
import {
  getTodos,
  addTodo,
  updateTodo,
  deleteTodo,
  getCompletedTodos,
  getPendingTodos,
} from "./api";

function App() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState("all");
  const [newTodo, setNewTodo] = useState({ title: "", description: "" });
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [total, setTotal] = useState(0);

  // Fetch todos when page or filter changes
  useEffect(() => {
    fetchTodos();
  }, [filter, page]);

  const fetchTodos = async () => {
    let response;
    if (filter === "all") response = await getTodos(page, limit);
    else if (filter === "completed") response = await getCompletedTodos(page, limit);
    else response = await getPendingTodos(page, limit);

    setTodos(response.items);
    setTotal(response.total);
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.title.trim()) return alert("Please enter a title!");
    await addTodo(newTodo);
    setNewTodo({ title: "", description: "" });
    fetchTodos();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this todo?")) {
      await deleteTodo(id);
      fetchTodos();
    }
  };

  const handleToggleComplete = async (todo) => {
    await updateTodo(todo.id, { ...todo, is_completed: !todo.is_completed });
    fetchTodos();
  };

  const totalPages = Math.ceil(total / limit);

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
      <form onSubmit={handleAddTodo} style={styles.form}>
        <input
          type="text"
          placeholder="Enter title"
          value={newTodo.title}
          onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Enter description"
          value={newTodo.description}
          onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
          style={styles.input}
        />
        <button type="submit" style={styles.addButton}>
          ➕ Add
        </button>
      </form>

      {/* Filter Buttons */}
      <div style={styles.filterContainer}>
        {["all", "completed", "pending"].map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              setPage(1);
            }}
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
          Page {page} / {totalPages || 1}
        </span>
        <button
          onClick={() => setPage((prev) => (prev < totalPages ? prev + 1 : prev))}
          disabled={page >= totalPages}
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
    maxWidth: "900px",
    margin: "40px auto",
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
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
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
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
