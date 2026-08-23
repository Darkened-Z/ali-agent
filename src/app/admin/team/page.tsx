import { team } from "@/lib/mockData";

export default function TeamPage() {
  const totalHandled = team.reduce((s, t) => s + t.handled, 0);
  return (
    <>
      <div className="page-head">
        <h1>Team<span>· {team.length} members · {totalHandled} conversations handled today</span></h1>
        <div className="actions">
          <button className="btn">Roles &amp; permissions</button>
          <button className="btn primary">+ Invite member</button>
        </div>
      </div>
      <div className="page-body">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th><th>Role</th><th>Email</th>
              <th>Last active</th><th>Handled today</th><th></th>
            </tr>
          </thead>
          <tbody>
            {team.map(t => (
              <tr key={t.id}>
                <td style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 24, height: 24, background: "var(--ink)", color: "var(--paper)",
                    display: "grid", placeItems: "center",
                    fontFamily: "var(--font-jbmono)", fontWeight: 700, fontSize: 10,
                  }}>
                    {t.name.charAt(0)}
                  </div>
                  {t.name}
                </td>
                <td><span className="badge">{t.role.toUpperCase()}</span></td>
                <td><span className="mono" style={{ fontSize: 12 }}>{t.email}</span></td>
                <td><span className="mono" style={{ fontSize: 12 }}>{t.active}</span></td>
                <td><span className="mono">{t.handled}</span></td>
                <td><button className="btn ghost">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
