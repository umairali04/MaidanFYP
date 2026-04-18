'use client'

export default function OwnerDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Owner Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2>Total Grounds</h2>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2>Total Bookings</h2>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2>Revenue</h2>
        </div>

      </div>
    </div>
  )
}