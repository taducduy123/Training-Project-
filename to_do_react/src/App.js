import React, { useEffect, useState, useCallback } from "react";
import { Table, Input, Button, Space, Tag, message, Modal } from "antd";
import { SearchOutlined, DeleteOutlined, CheckOutlined, UndoOutlined } from "@ant-design/icons";
import {
  getTodos,
  getCompletedTodos,
  getPendingTodos,
  updateTodo,
  deleteTodo,
} from "./api";


const App = () => {
  const [todos, setTodos] = useState([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("all");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [errors, setErrors] = useState("");

  // --- Add new todo ---
const addTodoToAPI = async ({ title, description }) => {
  try {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, is_completed: false }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }

    message.success("✅ Todo added successfully!");
    setTitle("");
    setDescription("");
    setPage(1); // reset to first page
    refreshTodos(); // 🔁 reload table data

  } catch (err) {
    console.error("❌ Error adding todo:", err);
    message.error("Failed to add todo");
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();

  const newErrors = { title: "", description: "" };
  if (!title.trim()) newErrors.title = "Enter title";
  if (!description.trim()) newErrors.description = "Enter description";

  if (newErrors.title || newErrors.description) {
    setErrors(newErrors);
    message.warning("Please fill out all fields before submitting!");
    return;
  }

  setErrors({ title: "", description: "" });
  await addTodoToAPI({ title, description });
};
  

  // 🔁 Fetch todos
  const fetchTodos = useCallback(async () => {
    setLoading(true);
    try {
      const skip = (pagination.current - 1) * pagination.pageSize;
      let data;

      if (filter === "completed") data = await getCompletedTodos(skip, pagination.pageSize);
      else if (filter === "pending") data = await getPendingTodos(skip, pagination.pageSize);
      else data = await getTodos(skip, pagination.pageSize);

      let items = data.items || [];

      // 🔍 Local search filter
      if (searchText.trim()) {
        const lower = searchText.toLowerCase();
        items = items.filter(
          (todo) =>
            todo.title.toLowerCase().includes(lower) ||
            todo.description.toLowerCase().includes(lower)
        );
      }

      setTodos(items);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("❌ Error fetching todos:", err);
      message.error("Failed to load todos");
    } finally {
      setLoading(false);
    }
  }, [filter, pagination, searchText]);

  // 👇 Fetch when filter, pagination, or search changes
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // ✅ Shared refresh helper
  const refreshTodos = async () => {
    await fetchTodos();
  };

  // ✅ Toggle completion
  const handleToggleComplete = async (todo) => {
    try {
      await updateTodo(todo.id, { ...todo, is_completed: !todo.is_completed });
      message.success(todo.is_completed ? "Marked as pending" : "Marked as completed");
      refreshTodos();
    } catch (err) {
      console.error("❌ Error toggling todo:", err);
      message.error("Failed to update status");
    }
  };

  // ✅ Delete todo
  const handleDelete = (id) => {
    Modal.confirm({
      title: "🗑️ Confirm Deletion",
      content: "Are you sure you want to delete this todo?",
      okText: "Yes, delete it",
      okType: "danger",
      cancelText: "Cancel",
      centered: true,
      onOk: async () => {
        try {
          await deleteTodo(id);
          message.success("Todo deleted successfully!");
          refreshTodos();
        } catch (err) {
          console.error("❌ Error deleting todo:", err);
          message.error("Failed to delete todo");
        }
      },
    });
  };
  

  // ✅ Table columns
  const columns = [
    {
      title: "#",
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
      width: 60,
    },
    {
      title: "Title",
      dataIndex: "title",
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: "Description",
      dataIndex: "description",
    },
    {
      title: "Status",
      dataIndex: "is_completed",
      render: (completed) =>
        completed ? (
          <Tag color="green">✅ Completed</Tag>
        ) : (
          <Tag color="orange">⏳ Pending</Tag>
        ),
      filters: [
        { text: "Completed", value: "completed" },
        { text: "Pending", value: "pending" },
      ],
      onFilter: (value, record) =>
        value === "completed" ? record.is_completed : !record.is_completed,
    },
    {
      title: "Actions",
      render: (record) => (
        <Space>
          <Button
            icon={record.is_completed ? <UndoOutlined /> : <CheckOutlined />}
            onClick={() => handleToggleComplete(record)}
            type={record.is_completed ? "default" : "primary"}
          >
            {record.is_completed ? "Undo" : "Done"}
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>📝 Todo List </h1>

      {/* 🔍 Search bar */}
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search todos..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          prefix={<SearchOutlined />}
          style={{ width: 250 }}
        />

        {/* Filter buttons */}
        <Button
          type={filter === "all" ? "primary" : "default"}
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button
          type={filter === "completed" ? "primary" : "default"}
          onClick={() => setFilter("completed")}
        >
          Completed
        </Button>
        <Button
          type={filter === "pending" ? "primary" : "default"}
          onClick={() => setFilter("pending")}
        >
          Pending
        </Button>
      </Space>

      {/* 🧾 Ant Design Table */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={todos}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: total,
          showSizeChanger: false,
        }}
        onChange={(pag) => setPagination(pag)}
        bordered
      />
    </div>
  );
};

export default App;

// 💅 Styles
const styles = {
  container: {
    width: "100vw",
    minHeight: "90vh",
    padding: "30px",
    background: "linear-gradient(135deg, #fbc2eb, #a18cd1)",
  },
  header: {
    textAlign: "center",
    fontSize: "32px",
    marginBottom: "20px",
    color: "#333",
  },
};

// import React, { useState, useEffect, useCallback } from "react";
// import { Table, Button, Space, Tag, Select, message, Popconfirm } from "antd";
// import { fetchTodos, updateTodo, deleteTodo, addTodo } from "./api";

// const { Option } = Select;

// const TodoTable = () => {
//   const [todos, setTodos] = useState([]);
//   const [filter, setFilter] = useState("all");
//   const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
//   const [loading, setLoading] = useState(false);

//   // 🧩 Fetch data with filter + pagination
//   const loadTodos = useCallback(async () => {
//     try {
//       setLoading(true);
//       const skip = (pagination.current - 1) * pagination.pageSize;
//       const data = await fetchTodos(filter, skip, pagination.pageSize);
//       setTodos(data.items);
//       setPagination((prev) => ({ ...prev, total: data.total }));
//     } catch (err) {
//       console.error("❌ Error fetching todos:", err);
//       message.error("Failed to fetch todos");
//     } finally {
//       setLoading(false);
//     }
//   }, [filter, pagination.current, pagination.pageSize]);

//   useEffect(() => {
//     loadTodos();
//   }, [loadTodos]);

//   // ✅ Toggle complete
//   const handleToggleComplete = async (todo) => {
//     try {
//       await updateTodo(todo.id, { ...todo, is_completed: !todo.is_completed });
//       message.success(`Todo marked as ${todo.is_completed ? "pending" : "done"}`);
//       loadTodos();
//     } catch {
//       message.error("Failed to update todo");
//     }
//   };

//   // ✅ Delete todo
//   const handleDelete = async (id) => {
//     try {
//       await deleteTodo(id);
//       message.success("🗑️ Deleted successfully!");
//       loadTodos();
//     } catch {
//       message.error("Failed to delete todo");
//     }
//   };

//   return (
//     <div style={{ maxWidth: 900, margin: "40px auto", padding: 20 }}>
//       <h2 style={{ textAlign: "center", marginBottom: 20 }}>📝 Todo Manager</h2>

//       {/* 🔽 Filter */}
//       <Space style={{ marginBottom: 16 }}>
//         <Select value={filter} onChange={setFilter} style={{ width: 200 }}>
//           <Option value="all">All</Option>
//           <Option value="completed">Completed</Option>
//           <Option value="pending">Pending</Option>
//         </Select>
//       </Space>

//       {/* 📋 Table */}
//       <Table
//         dataSource={todos.map((t) => ({ ...t, key: t.id }))}
//         loading={loading}
//         pagination={{
//           current: pagination.current,
//           pageSize: pagination.pageSize,
//           total: pagination.total,
//           showSizeChanger: true,
//           onChange: (page, pageSize) =>
//             setPagination({ ...pagination, current: page, pageSize }),
//         }}
//       >
//         <Table.Column title="Title" dataIndex="title" sorter={(a, b) => a.title.localeCompare(b.title)} />
//         <Table.Column title="Description" dataIndex="description" />
//         <Table.Column
//           title="Status"
//           render={(todo) =>
//             todo.is_completed ? <Tag color="green">Done</Tag> : <Tag color="blue">Pending</Tag>
//           }
//         />
//         <Table.Column
//           title="Actions"
//           render={(todo) => (
//             <Space>
//               <Button type="link" onClick={() => handleToggleComplete(todo)}>
//                 {todo.is_completed ? "Undo" : "Done"}
//               </Button>
//               <Popconfirm
//                 title="Are you sure delete this todo?"
//                 onConfirm={() => handleDelete(todo.id)}
//                 okText="Yes"
//                 cancelText="No"
//               >
//                 <Button danger type="link">
//                   Delete
//                 </Button>
//               </Popconfirm>
//             </Space>
//           )}
//         />
//       </Table>
//     </div>
//   );
// };

// export default TodoTable;
