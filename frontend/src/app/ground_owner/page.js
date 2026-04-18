"use client";

import { useState } from "react";

export default function AddGround() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    sportType: "CRICKET",
    location: "",
    city: "",
    pricePerHour: "",
    openTime: "",
    closeTime: "",
    slotDuration: 60,
    images: "",
    facilities: "",
    latitude: "",
    longitude: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      images: form.images.split(","),       // comma separated
      facilities: form.facilities.split(","), 
      ownerId: "REPLACE_WITH_LOGGED_IN_USER_ID",
    };

    const res = await fetch("/api/grounds", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("Ground Added Successfully");
    } else {
      alert("Error adding ground");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow">
        <h2 className="text-2xl font-bold mb-6">Add New Ground</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <input name="name" placeholder="Ground Name" onChange={handleChange} className="input" required />

          <select name="sportType" onChange={handleChange} className="input">
            <option>CRICKET</option>
            <option>FOOTBALL</option>
            <option>HOCKEY</option>
            <option>BADMINTON</option>
            <option>TENNIS</option>
          </select>

          <input name="location" placeholder="Location" onChange={handleChange} className="input" required />
          <input name="city" placeholder="City" onChange={handleChange} className="input" required />

          <input name="pricePerHour" type="number" placeholder="Price per Hour" onChange={handleChange} className="input" required />

          <input name="openTime" type="time" onChange={handleChange} className="input" required />
          <input name="closeTime" type="time" onChange={handleChange} className="input" required />

          <input name="slotDuration" type="number" placeholder="Slot Duration (mins)" onChange={handleChange} className="input" />

          <input name="latitude" placeholder="Latitude (optional)" onChange={handleChange} className="input" />
          <input name="longitude" placeholder="Longitude (optional)" onChange={handleChange} className="input" />

          <textarea name="description" placeholder="Description" onChange={handleChange} className="input col-span-2" />

          <textarea name="images" placeholder="Image URLs (comma separated)" onChange={handleChange} className="input col-span-2" />

          <textarea name="facilities" placeholder="Facilities (comma separated e.g Parking, Lights)" onChange={handleChange} className="input col-span-2" />

          <button className="col-span-2 bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition">
            Add Ground
          </button>
        </form>
      </div>

      <style jsx>{`
        .input {
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 10px;
          width: 100%;
        }
      `}</style>
    </div>
  );
}