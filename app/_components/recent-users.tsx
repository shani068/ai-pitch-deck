import { connection } from "next/server";
import { db } from "@/src/prisma/db";

// Request-time database read. `connection()` keeps the query out of build-time prerendering,
// and the caller renders this inside <Suspense> so the rest of the page stays in the static shell.
// Emails are deliberately not selected: this is a public page.
export async function RecentUsers() {
  await connection();

  let users: { id: number; name: string | null; createdAt: Date }[];
  try {
    users = await db.orm.public.User.select("id", "name", "createdAt")
      .orderBy((u) => u.id.asc())
      .limit(5)
      .all();
  } catch (error) {
    // Log only the error code; driver messages can include connection details.
    const code = error instanceof Error && "code" in error ? String(error.code) : "UNKNOWN";
    console.error(`[recent-users] database query failed (${code})`);
    return <p className="text-sm text-destructive">Could not load users right now.</p>;
  }

  if (users.length === 0) {
    return <p className="text-sm text-muted-foreground">No users yet.</p>;
  }

  return (
    <ul className="w-full divide-y divide-border rounded-lg border border-border text-sm">
      {users.map((user) => (
        <li key={user.id} className="flex justify-between gap-4 px-4 py-2">
          <span className="text-foreground">{user.name ?? "Unnamed user"}</span>
          <span className="font-mono text-muted-foreground">
            #{user.id} · {user.createdAt.toISOString().slice(0, 10)}
          </span>
        </li>
      ))}
    </ul>
  );
}
