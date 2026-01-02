function Dashboard() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-8">

      <h1 className="text-4xl font-bold">Logged in as admin</h1>

      <div className="flex flex-col gap-4">
        <button className="btn-primary">
          Test Primary Button
        </button>
        <button className="btn-secondary">
          Test Secondary Button
        </button>
        <button className="btn-outline">
          Test Outline Button
        </button>
      </div>
    </div>
  );
}

export default Dashboard;