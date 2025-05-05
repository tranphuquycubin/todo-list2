"use client";
import { useState, useEffect, ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Todo from "./todo";

export interface Task {
  id: number;
  text: string;
  completed: boolean;
  start_time?: string;
  deadline?: string;
}
export default function TodoList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<string>("");
 
  const [newStartTime, setNewStartTime] = useState<string>(
    new Date().toISOString().slice(0, 16)
  );
  const [newDeadline, setNewDeadline] = useState<string>("");
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
          {filterTasks.map((task, index) => (
            <Todo task={task} key={index} setTasks={setTasks} tasks={tasks} />
          ))}
        </div>
      </div>
    </div>
  );
}
