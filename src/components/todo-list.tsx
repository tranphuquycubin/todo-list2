"use client";
import { useState, useEffect, ChangeEvent, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface Task {
  id: number;
  text: string;
  completed: boolean;
  start_time?: string;
  deadline?: string;
}
export default function TodoList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>("");
  const [editTaskId, setEditTaskId] = useState<number | null>(null);
  const [editTaskText, setEditTaskText] = useState<string>("");
  const [newStartTime, setNewStartTime] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );
  const [editStartTime, setEditStartTime] = useState<string>("");
  const [newDeadline, setNewDeadline] = useState<string>("");
  const [editDeadline, setEditDeadline] = useState<string>("");
  const [filter, setFilter] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("");
  useEffect(() => {
    fetch("/api/tasks")
      .then((res) => res.json())
      .then((data) => setTasks(data));
  }, []);

  // Function to add a new task
  const addTask = async (): Promise<void> => {
    if (newTask.trim() === "") return;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: newTask,
        start_time: newStartTime,
        deadline: newDeadline,
      }),
    });
    const newCreated = await res.json();
    setTasks([...tasks, newCreated]);
    setNewTask("");
    setNewStartTime(new Date().toISOString().slice(0, 16));
    setNewDeadline(new Date().toISOString().slice(0, 16));
  };

  const toggleCompletionStatus = async (id: number): Promise<void> => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const res = await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task.id, completed: !task.completed }),
    });
    const updated = await res.json();
    setTasks(tasks.map((t) => (t.id === id ? updated : t)));
  };

  const editTask = (
    id: number,
    text: string,
    start_time?: string,
    deadline?: string
  ): void => {
    setEditTaskId(id);
    setEditTaskText(text);
    setEditStartTime(
      start_time?.slice(0, 16) || new Date().toISOString().slice(0, 16)
    );
    setEditDeadline(deadline?.slice(0, 16) || "");
  };

  const updateTask = async (): Promise<void> => {
    if (editTaskText.trim() === "" || editTaskId === null) return;

    const res = await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editTaskId,
        text: editTaskText,
        completed: tasks.find((t) => t.id === editTaskId)?.completed || false,
        start_time: editStartTime,
        deadline: editDeadline,
      }),
    });

    const updated = await res.json();
    setTasks(tasks.map((t) => (t.id === editTaskId ? updated : t)));
    setEditTaskId(null);
    setEditTaskText("");
    setEditStartTime("");
    setEditDeadline("");
  };

  const deleteTask = async (id: number): Promise<void> => {
    await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
    setTasks(tasks.filter((t) => t.id !== id));
  };
  const isOverdue = (task: Task): boolean => {
    if (!task.deadline || task.completed) return false;
    const now = new Date();
    const deadline = new Date(task.deadline);
    return now > deadline;
  };
  const filterTasks = tasks.filter((task) => {
    const today = new Date();
    const taskStart = task.start_time ? new Date(task.start_time) : null;
  
    if (filter === "today") {
      return (
        taskStart &&
        taskStart.getFullYear() === today.getFullYear() &&
        taskStart.getMonth() === today.getMonth() &&
        taskStart.getDate() === today.getDate()
      );
    }
  
    if (filter === "completed") {
      return task.completed;
    }
  
    if (filter === "incompleted") {
      return !task.completed;
    }
  
    if (filter === "date" && filterDate) {
      const selectedDate = new Date(filterDate);
      return (
        taskStart &&
        taskStart.getFullYear() === selectedDate.getFullYear() &&
        taskStart.getMonth() === selectedDate.getMonth() &&
        taskStart.getDate() === selectedDate.getDate()
      );
    }
  
    return true; // all
  });
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-purple-800 dark:text-gray-200">
          Todo List
        </h1>
        <div className="flex gap-4 text-sm text-gray-700 dark:text-gray-300 mb-4">
          <div>Total tasks: {tasks.length}</div>
          <div>Completed tasks: {tasks.filter((t) => t.completed).length}</div>
          <div>Remaining tasks: {tasks.filter((t) => !t.completed).length}</div>
        </div>
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
          >
            <option value="all">All Tasks</option>
            <option value="today">Today</option>
            <option value="completed">Completed</option>
            <option value="incompleted">Incompleted</option>
            <option value="date">Filter by Starting Date</option>
          </select>

          {filter === "date" && (
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
            />
          )}
        </div>

        {/* Form input task */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Input
            type="text"
            placeholder="Add a new task"
            value={newTask}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setNewTask(e.target.value)
            }
            className="col-span-1 md:col-span-1"
          />
          <input
            type="datetime-local"
            value={newStartTime}
            onChange={(e) => setNewStartTime(e.target.value)}
            className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 col-span-1"
          />
          <input
            type="datetime-local"
            value={newDeadline}
            onChange={(e) => setNewDeadline(e.target.value)}
            className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 col-span-1"
          />
          <Button
            onClick={addTask}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md col-span-1"
          >
            Add
          </Button>
        </div>

        {/* List of tasks */}
        <div className="space-y-4">
          {filterTasks.map((task) => (
            <div
              key={task.id}
              className="flex flex-col bg-gray-100 dark:bg-gray-700 rounded-md px-4 py-3 min-h-[180px]"
            >
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div className="flex items-start flex-1 gap-2">
                  <Checkbox
                    checked={task.completed}
                    className="mt-1"
                    onCheckedChange={() => toggleCompletionStatus(task.id)}
                  />
                  {editTaskId === task.id ? (
                    <div className="flex flex-col space-y-2 w-full">
                      <Input
                        type="text"
                        value={editTaskText}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          setEditTaskText(e.target.value)
                        }
                        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                          if (e.key === "Enter") {
                            updateTask();
                          }
                        }}
                        className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                      />
                      <input
                        type="datetime-local"
                        value={editStartTime}
                        onChange={(e) => setEditStartTime(e.target.value)}
                        className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                      />
                      <input
                        type="datetime-local"
                        value={editDeadline}
                        onChange={(e) => setEditDeadline(e.target.value)}
                        className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <span
                        className={`text-gray-800 dark:text-gray-200 ${
                          task.completed
                            ? "line-through text-gray-500 dark:text-gray-400"
                            : isOverdue(task)
                            ? "text-red-600 dark:text-red-400 font-bold"
                            : ""
                        }`}
                      >
                        {task.text}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Start:{" "}
                        {task.start_time
                          ? new Date(task.start_time).toLocaleString()
                          : "N/A"}
                      </p>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-col">
                        <span>
                          Deadline:{" "}
                          {task.deadline
                            ? new Date(task.deadline).toLocaleString()
                            : "N/A"}
                        </span>
                        {isOverdue(task) && (
                          <span className="text-red-600 dark:text-red-400 font-bold">
                            Overdue!
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2">
                  {editTaskId === task.id ? (
                    <Button
                      onClick={updateTask}
                      className="bg-black hover:bg-slate-800 text-white font-medium py-1 px-3 rounded-md"
                    >
                      Save
                    </Button>
                  ) : (
                    <Button
                      onClick={() =>
                        editTask(
                          task.id,
                          task.text,
                          task.start_time,
                          task.deadline
                        )
                      }
                      className="bg-purple-300 hover:bg-purple-400 text-purple-900 dark:bg-purple-500 dark:hover:bg-purple-600 dark:text-white font-medium py-1 px-3 rounded-md"
                    >
                      Edit
                    </Button>
                  )}
                  <Button
                    onClick={() => deleteTask(task.id)}
                    className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-3 rounded-md"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
