"use client";
import { useState, useEffect, ChangeEvent, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface Task {
  id: number;
  text: string;
  completed: boolean;
}
export default function TodoList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>("");
  const [editTaskId, setEditTaskId] = useState<number | null>(null);
  const [editTaskText, setEditTaskText] = useState<string>("");
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
      body: JSON.stringify({ text: newTask }),
    });
    const newCreated = await res.json();
    setTasks([...tasks, newCreated]);
    setNewTask("");
  };
  
 
  const toggleCompletionStatus = async (id: number): Promise<void> => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const res = await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...task, completed: !task.completed }),
    });
    const updated = await res.json();
    setTasks(tasks.map(t => t.id === id ? updated : t));
  };
  
  
  const editTask = (id: number, text: string): void => {
    setEditTaskId(id);
    setEditTaskText(text);
  };

  const updateTask = async (): Promise<void> => {
    if (editTaskText.trim() === "" || editTaskId === null) return;
  
    const res = await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: editTaskId,
        text: editTaskText,
        completed: tasks.find(t => t.id === editTaskId)?.completed || false
      }),
    });
  
    const updated = await res.json();
    setTasks(tasks.map(t => t.id === editTaskId ? updated : t));
    setEditTaskId(null);
    setEditTaskText("");
  };
  
  const deleteTask = async (id: number): Promise<void> => {
    await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
    setTasks(tasks.filter(t => t.id !== id));
  };
  
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          Todo List
        </h1>
        <div className="flex items-center mb-4">
          <Input
            type="text"
            placeholder="Add a new task"
            value={newTask}
            onChange={
              (e: ChangeEvent<HTMLInputElement>) => setNewTask(e.target.value) // Update new task input
            }
            className="flex-1 mr-2 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
          />
          <Button
            onClick={addTask}
            className="bg-black hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-md"
          >
            Add
          </Button>
        </div>
        {/* List of tasks */}
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 rounded-md px-4 py-2"
            >
              <div className="flex items-center">
                {/* Checkbox to toggle task completion */}
                <Checkbox
                  checked={task.completed}
                  className="mr-2"
                  onCheckedChange={() => toggleCompletionStatus(task.id)}
                />
                {editTaskId === task.id ? (
                  <Input
                    type="text"
                    value={editTaskText}
                    onChange={
                      (e: ChangeEvent<HTMLInputElement>) =>
                        setEditTaskText(e.target.value)
                    }
                    onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === "Enter") {
                        updateTask(); 
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                  />
                ) : (
                  <span
                    className={`flex-1 text-gray-800 dark:text-gray-200 ${
                      task.completed
                        ? "line-through text-gray-500 dark:text-gray-400"
                        : ""
                    }`}
                  >
                    {task.text}
                  </span>
                )}
              </div>
              <div className="flex items-center">
                {editTaskId === task.id ? (
                  <Button
                    onClick={updateTask}
                    className="bg-black hover:bg-slate-800 text-white font-medium py-1 px-2 rounded-md mr-2"
                  >
                    Save
                  </Button>
                ) : (
                  <Button
                    onClick={() => editTask(task.id, task.text)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200 font-medium py-1 px-2 rounded-md mr-2"
                  >
                    Edit
                  </Button>
                )}
                <Button
                  onClick={() => deleteTask(task.id)}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-2 rounded-md"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
