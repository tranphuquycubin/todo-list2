import React, { ChangeEvent, KeyboardEvent, useState } from 'react'
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Task } from './todo-list';


interface TodoProperties {
    task: Task;
    tasks: Task[];
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  }
  


  export default function Todo({ task, tasks, setTasks }: TodoProperties) {
    const [editTaskId, setEditTaskId] = useState<number | null>(null);
    const [editTaskText, setEditTaskText] = useState<string>("");
    const [editStartTime, setEditStartTime] = useState<string>("");
    const [editDeadline, setEditDeadline] = useState<string>("");
    

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

  return (
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
  )
}
