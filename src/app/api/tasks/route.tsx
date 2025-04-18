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
  const { text,start_time,deadline } = body;
  const { rows } = await pool.query(
    "INSERT INTO tasks (text, completed, start_time,deadline) VALUES ($1, false, $2,$3) RETURNING *",
    [text , start_time || new Date(), deadline || null]
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
  const { id, text, completed, start_time,deadline } = body;

  const updates = [];
  const values = [];
  let idx = 1;

  if (text !== undefined) {
    updates.push(`text = $${idx++}`);
    values.push(text);
  }

  if (completed !== undefined) {
    updates.push(`completed = $${idx++}`);
    values.push(completed);
  }

  if (start_time !== undefined) {
    updates.push(`start_time = $${idx++}`);
    values.push(start_time);
  }
  if (deadline !== undefined) {
    updates.push(`deadline = $${idx++}`);
    values.push(deadline);
  }

  values.push(id); 

  const query = `
    UPDATE tasks SET ${updates.join(", ")}
    WHERE id = $${idx}
    RETURNING *
  `;

  const { rows } = await pool.query(query, values);
  return NextResponse.json(rows[0]);
}


