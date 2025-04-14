import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET() {
  const { rows } = await pool.query("SELECT * FROM tasks ORDER BY id");
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { text } = body;
  const { rows } = await pool.query(
    "INSERT INTO tasks (text, completed) VALUES ($1, false) RETURNING *",
    [text]
  );
  return NextResponse.json(rows[0]);
}
export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing task id" }, { status: 400 });
  }

  await pool.query("DELETE FROM tasks WHERE id = $1", [id]);
  return NextResponse.json({ message: "Task deleted" });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const { id, text, completed } = body;

  const { rows } = await pool.query(
    "UPDATE tasks SET text = $1, completed = $2 WHERE id = $3 RETURNING *",
    [text, completed, id]
  );
  return NextResponse.json(rows[0]);
}

