import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import dayjs from "dayjs";
import { FiEdit, FiTrash2 } from "react-icons/fi";

// TaskManagement Component
const TaskManagement = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // State declarations
  const [tasks, setTasks] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState("");
  const [expandedTask, setExpandedTask] = useState(null);
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("");
  const [labels, setLabels] = useState([]);
  const [labelInput, setLabelInput] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);
  const [taskAnalytics, setTaskAnalytics] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    averageCompletionTime: "0 hours",
  });

  // Fetch tasks and collaborators (combined as fetchData)
  const fetchData = async () => {
    setLoading(true);
    try {
      const [tasksRes, usersRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/project/${projectId}/tasks`, {
          withCredentials: true,
        }),
        axios.get(`${BASE_URL}/api/project/${projectId}/users`, {
          withCredentials: true,
        }),
      ]);
      setTasks(tasksRes.data.data);
      setCollaborators(usersRes.data.data);
      await fetchTaskAnalytics();
    } catch (err) {
      setError("Failed to fetch data.");
      console.error("Error in fetchData:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchTaskAnalytics();
  }, [projectId]);

  // Fetch upcoming tasks (deadlines)
  useEffect(() => {
    const fetchUpcomingTasks = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/project/${projectId}/tasks/deadlines`,
          { withCredentials: true }
        );
        setUpcomingTasks(res.data.data);
      } catch (err) {
        console.error("Failed to fetch tasks nearing deadline:", err);
      }
    };
    fetchUpcomingTasks();
  }, [projectId]);

  // Fetch task analytics
  const fetchTaskAnalytics = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/project/${projectId}/tasks/analytics`, {
        withCredentials: true,
      });
      setTaskAnalytics(res.data.data);
    } catch (err) {
      console.error("Failed to fetch task analytics:", err);
    }
  };

  // Fetch comments for a task
  const fetchComments = async (taskId) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/project/${projectId}/task/${taskId}/comments`, {
        withCredentials: true,
      });
      setComments((prev) => ({ ...prev, [taskId]: res.data.data }));
    } catch (err) {
      console.error("Failed to fetch comments:", err);
    }
  };

  // Add comment to a task
  const addComment = async (taskId) => {
    if (newComment.trim() === "") return;
    try {
      await axios.post(
        `${BASE_URL}/api/project/${projectId}/task/${taskId}/comment`,
        { text: newComment },
        { withCredentials: true }
      );
      setNewComment("");
      fetchComments(taskId);
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  // Toggle comments visibility
  const toggleComments = (taskId) => {
    if (expandedTask === taskId) {
      setExpandedTask(null);
    } else {
      fetchComments(taskId);
      setExpandedTask(taskId);
    }
  };

  // Delete a task
  const deleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await axios.delete(`${BASE_URL}/api/project/${projectId}/task/${taskId}`, {
          withCredentials: true,
        });
        setTasks((prev) => prev.filter((task) => task._id !== taskId));
        await fetchTaskAnalytics();
      } catch (err) {
        console.error("Failed to delete task:", err);
      }
    }
  };

  // Save (create or edit) task
  const handleTaskSave = async () => {
    if (newTask.trim() === "") return;
    try {
      if (isEditing && editTaskId) {
        const updateData = {
          title: newTask,
          description: description.trim() || null,
          dueDate: dueDate || null,
          priority: priority || undefined,
          labels: labels.length > 0 ? labels : [],
        };
        await axios.patch(
          `${BASE_URL}/api/project/${projectId}/task/${editTaskId}/details`,
          updateData,
          { withCredentials: true, headers: { "Content-Type": "application/json" } }
        );
        await fetchData();
        setIsEditing(false);
        setEditTaskId(null);
      } else {
        const res = await axios.post(
          `${BASE_URL}/api/project/${projectId}/task`,
          {
            title: newTask,
            description: description.trim() || null,
            dueDate: dueDate || null,
            priority,
            labels: labels.length > 0 ? labels : [],
          },
          { withCredentials: true }
        );
        setTasks((prev) => [...prev, res.data.data]);
      }
      await fetchTaskAnalytics();
      setIsFormOpen(false);
      setNewTask("");
      setDescription("");
      setDueDate("");
      setPriority("");
      setLabels([]);
    } catch (err) {
      console.error("Failed to save task:", err);
    }
  };

  // Prepare to edit a task
  const handleEditTask = (task) => {
    setNewTask(task.title);
    setDescription(task.description || "");
    setDueDate(task.dueDate ? dayjs(task.dueDate).format("YYYY-MM-DD") : "");
    setPriority(task.priority || "Medium");
    setLabels(task.labels || []);
    setIsFormOpen(true);
    setIsEditing(true);
    setEditTaskId(task._id);
  };

  // Update task status
  const updateTaskStatus = async (taskId, status) => {
    try {
      await axios.patch(
        `${BASE_URL}/api/project/${projectId}/task/${taskId}`,
        { status },
        { withCredentials: true }
      );
      await fetchTaskAnalytics();
    } catch (err) {
      console.error("Failed to update task status:", err);
    }
  };

  // Assign task to collaborator
  const assignTask = async (taskId, userId) => {
    try {
      await axios.patch(
        `${BASE_URL}/api/project/${projectId}/task/${taskId}/assign`,
        { assignedTo: userId },
        { withCredentials: true }
      );
      setTasks((prev) =>
        prev.map((task) =>
          task._id === taskId ? { ...task, assignedTo: userId } : task
        )
      );
    } catch (err) {
      console.error("Failed to assign task:", err);
    }
  };

  // Drag and Drop handler
  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    const task = tasks.find((task) => task._id === draggableId);
    if (
      source.droppableId === "To Do" &&
      destination.droppableId === "In Progress" &&
      !task.assignedTo
    ) {
      alert("Please assign this task before moving it to In Progress.");
      return;
    }
    if (source.droppableId !== destination.droppableId) {
      await updateTaskStatus(draggableId, destination.droppableId);
      setTasks((prev) =>
        prev.map((task) =>
          task._id === draggableId ? { ...task, status: destination.droppableId } : task
        )
      );
    }
  };

  // Render tasks for a given status using Draggable
  const renderTasks = (status) => {
    return tasks
      .filter((task) => task.status === status)
      .map((task, index) => (
        <Draggable key={task._id} draggableId={task._id} index={index}>
          {(provided) => (
            <div
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              ref={provided.innerRef}
              className="bg-gray-900 p-4 mb-4 rounded-lg text-white shadow-md hover:shadow-xl transition-shadow"
            >
              <h4 className="font-bold text-lg mb-2 text-blue-400">{task.title}</h4>
              {task.description && (
                <p className="text-sm text-gray-400 mb-2">{task.description}</p>
              )}
              {task.dueDate && (
                <p className="text-sm text-red-500 mb-2">
                  🗓️ Due: {dayjs(task.dueDate).format("DD MMM, YYYY")}
                </p>
              )}
              {task.labels && task.labels.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {task.labels.map((label, idx) => (
                    <span key={idx} className="bg-blue-500 text-white px-2 py-1 rounded-lg text-xs">
                      {label}
                    </span>
                  ))}
                </div>
              )}
              <div className="mb-2">
                <span className="text-sm text-gray-300">Priority: </span>
                <button
                  className={`px-2 py-1 rounded-full text-xs text-white ${
                    task.status === "OverDue"
                      ? "bg-red-800"
                      : task.priority === "High"
                      ? "bg-red-600"
                      : task.priority === "Medium"
                      ? "bg-yellow-500"
                      : task.priority === "Low"
                      ? "bg-green-500"
                      : "bg-gray-500"
                  }`}
                >
                  {task.status === "OverDue" ? "Overdue" : task.priority || "No Priority Set"}
                </button>
              </div>
              {task.assignedTo && (
                <p className="text-sm text-green-400 mb-2">
                  👤 Assigned to:{" "}
                  {collaborators.find((user) => user._id === task.assignedTo)?.firstName || "Unknown"}
                </p>
              )}
              <select
                value={task.assignedTo || ""}
                onChange={(e) => assignTask(task._id, e.target.value)}
                className="w-full mb-2 p-2 bg-gray-800 text-white rounded"
              >
                <option value="">Assign to...</option>
                {collaborators.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.firstName} {user.lastName}
                  </option>
                ))}
              </select>
              <button
                className="text-blue-400 text-sm mb-2 hover:underline"
                onClick={() => toggleComments(task._id)}
              >
                {expandedTask === task._id ? "Hide Comments" : "View Comments"}
              </button>
              {expandedTask === task._id && (
                <div className="mt-2 bg-gray-800 p-2 rounded">
                  <h5 className="text-yellow-400 mb-2">Comments:</h5>
                  {comments[task._id] && comments[task._id].length > 0 ? (
                    comments[task._id].map((comment) => (
                      <p key={comment._id} className="text-sm text-gray-300 mb-1">
                        <span className="font-bold text-yellow-400">
                          {comment.createdBy.firstName}:
                        </span>{" "}
                        {comment.text}
                      </p>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">No comments yet.</p>
                  )}
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full p-1 mb-2 rounded bg-gray-900 text-white"
                    />
                    <button
                      className="bg-green-600 p-1 rounded text-sm w-full hover:bg-green-500"
                      onClick={() => addComment(task._id)}
                    >
                      Add Comment
                    </button>
                  </div>
                </div>
              )}
              <div className="flex gap-2 mt-2">
                <button
                  className="bg-blue-600 p-2 rounded-full text-white hover:bg-blue-500 transition-colors"
                  title="Edit Task"
                  onClick={() => handleEditTask(task)}
                >
                  <FiEdit size={20} />
                </button>
                <button
                  className="bg-red-600 p-2 rounded-full text-white hover:bg-red-500 transition-colors"
                  title="Delete Task"
                  onClick={() => deleteTask(task._id)}
                >
                  <FiTrash2 size={20} />
                </button>
              </div>
            </div>
          )}
        </Draggable>
      ));
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-gray-900 text-white p-6">
        {/* Back Arrow */}
        <button
          className="mb-4 p-2 bg-gray-800 rounded-full hover:bg-gray-700 text-white flex items-center transition-all duration-200"
          onClick={() => navigate(-1)}
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          <span className="text-sm">Back</span>
        </button>

        <h2 className="text-3xl font-bold mb-6 text-yellow-400 text-center">
          🗂️ Task Management
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="mb-6 bg-gray-800 p-4 rounded-lg shadow-md">
            <h3 className="text-yellow-400 text-lg font-bold mb-2">
              ⏳ Tasks Nearing Deadline
            </h3>
            {upcomingTasks.length > 0 ? (
              <ul>
                {upcomingTasks.map((task) => {
                  const daysLeft = dayjs(task.dueDate).diff(dayjs(), "day");
                  return (
                    <li key={task._id} className="mb-2 text-sm">
                      <span className="font-bold text-blue-400">
                        {task.title}
                      </span>{" "}
                      -{" "}
                      <span
                        className={`ml-2 ${
                          daysLeft <= 1 ? "text-red-500" : "text-yellow-500"
                        }`}
                      >
                        🗓️ Due in {daysLeft} {daysLeft > 1 ? "days" : "day"}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-gray-400">No tasks nearing deadline.</p>
            )}
          </div>
          <div className="mb-6 bg-gray-800 p-4 rounded-lg shadow-md">
            <h3 className="text-yellow-400 text-lg font-bold mb-2">
              📊 Task Analytics
            </h3>
            <ul className="text-white text-sm space-y-2">
              <li>
                <strong>Total Tasks:</strong> {taskAnalytics.totalTasks}
              </li>
              <li>
                <strong>Completed Tasks:</strong> {taskAnalytics.completedTasks}
              </li>
              <li>
                <strong>Pending Tasks:</strong> {taskAnalytics.pendingTasks}
              </li>
              <li>
                <strong>Average Completion Time:</strong> {taskAnalytics.averageCompletionTime}
              </li>
            </ul>
          </div>
        </div>

        {/* Accordion for Add/Edit Task Form */}
        <div className="mb-6 bg-gray-800 rounded-lg overflow-hidden shadow-md transition-all duration-300">
          <button
            className="w-full bg-gray-900 text-yellow-400 text-left p-3 font-bold flex items-center justify-between hover:bg-gray-700 transition-colors"
            onClick={() => setIsFormOpen(!isFormOpen)}
          >
            <span>{isEditing ? "Edit Task" : "Create New Task"}</span>
            <svg
              className={`w-5 h-5 transform transition-transform ${
                isFormOpen ? "rotate-180" : "rotate-0"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>

          {isFormOpen && (
            <div className="p-4 bg-gray-800 transition-all duration-300 space-y-3">
              <input
                type="text"
                placeholder="Task Title"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="w-full p-2 rounded bg-gray-900 text-white"
              />
              <textarea
                placeholder="Task Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 rounded bg-gray-900 text-white"
              />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2 rounded bg-gray-900 text-white"
              />
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-2 rounded bg-gray-900 text-white"
              >
                <option value="" disabled>
                  Select Priority
                </option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
              <div className="mb-2">
                <input
                  type="text"
                  placeholder="Add Label"
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && labelInput.trim()) {
                      setLabels([...labels, labelInput.trim()]);
                      setLabelInput("");
                    }
                  }}
                  className="w-full p-2 rounded bg-gray-900 text-white"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {labels.map((label, index) => (
                    <span
                      key={index}
                      className="bg-yellow-400 text-gray-900 px-2 py-1 rounded-lg cursor-pointer"
                      onClick={() => setLabels(labels.filter((_, i) => i !== index))}
                    >
                      {label} ✖
                    </span>
                  ))}
                </div>
              </div>
              <button
                className="p-2 bg-green-600 rounded hover:bg-green-500 w-full transition-all duration-200"
                onClick={handleTaskSave}
              >
                {isEditing ? "Update Task" : "Create Task"}
              </button>
              {isEditing && (
                <button
                  className="p-2 bg-red-600 rounded hover:bg-red-500 w-full mt-2 transition-all duration-200"
                  onClick={() => {
                    setIsEditing(false);
                    setEditTaskId(null);
                    setNewTask("");
                    setDescription("");
                    setDueDate("");
                    setPriority("");
                    setLabels([]);
                  }}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          )}
        </div>

        {/* Task Status Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {["To Do", "In Progress", "Done", "OverDue"].map((status) => (
            <Droppable key={status} droppableId={status}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                >
                  <h3 className="font-bold text-lg mb-2 text-yellow-400 text-center">
                    {status}
                  </h3>
                  {renderTasks(status)}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </div>
    </DragDropContext>
  );
};

export default TaskManagement;
