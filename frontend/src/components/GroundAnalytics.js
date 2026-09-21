"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function GroundAnalytics({
  groundId,
}) {
  const [analytics, setAnalytics] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!groundId) return;

    async function loadAnalytics() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${BASE_URL}/api/grounds/${groundId}/analytics`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Failed to load analytics"
          );
        }

        setAnalytics(data.analytics);
      } catch (err) {
        console.error(
          "Analytics error:",
          err
        );

        setError(
          err.message ||
            "Failed to load analytics."
        );
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [groundId]);

  // ---------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------

  if (loading) {
    return (
      <section className="bg-white rounded-2xl p-5 border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin" />

          <p className="text-sm text-gray-400">
            Loading ground analytics...
          </p>
        </div>
      </section>
    );
  }

  // ---------------------------------------------------------
  // ERROR
  // ---------------------------------------------------------

  if (error) {
    return (
      <section className="bg-white rounded-2xl p-5 border border-gray-100">
        <div className="bg-red-50 text-red-500 rounded-xl p-4 text-sm">
          Unable to load ground analytics.
        </div>
      </section>
    );
  }

  if (!analytics) {
    return null;
  }

  const {
    bookingsThisMonth = 0,
    totalBookings = 0,

    occupancyRate = 0,

    popularityScore = 0,
    popularityLabel = "Low Activity",

    peakPeriod = "No data",

    bookingGrowth = 0,

    monthlyData = [],
    bookingByTime = [],
  } = analytics;

  // ---------------------------------------------------------
  // GROWTH TEXT
  // ---------------------------------------------------------

  const growthPositive =
    bookingGrowth >= 0;

  // ---------------------------------------------------------
  // POPULARITY MESSAGE
  // ---------------------------------------------------------

  let popularityMessage =
    "This ground currently has limited booking activity.";

  if (popularityScore >= 75) {
    popularityMessage =
      "This ground is highly demanded and receives strong booking activity.";
  } else if (popularityScore >= 50) {
    popularityMessage =
      "This ground is performing well and has consistent booking activity.";
  } else if (popularityScore >= 25) {
    popularityMessage =
      "This ground is receiving moderate booking activity.";
  }

  return (
    <section className="bg-white rounded-2xl border border-gray-100 p-5 sm:p-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-6">

        <div className="flex items-center gap-2 mb-1">

          <span className="text-xl">
            📊
          </span>

          <h3 className="font-bold text-[#111] text-lg">
            Ground Analytics
          </h3>

        </div>

        <p className="text-gray-400 text-sm">
          Booking activity and performance overview
        </p>

      </div>

      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">

        {/* BOOKINGS THIS MONTH */}

        <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">

          <div className="text-xl mb-2">
            📅
          </div>

          <p className="text-gray-400 text-xs mb-1">
            Bookings This Month
          </p>

          <p className="text-[#111] font-bold text-2xl">
            {bookingsThisMonth}
          </p>

          <p
            className={`text-xs mt-1 font-medium ${
              growthPositive
                ? "text-[#00aa55]"
                : "text-red-500"
            }`}
          >
            {growthPositive
              ? "↑"
              : "↓"}{" "}
            {Math.abs(bookingGrowth)}%
            {" "}
            vs last month
          </p>

        </div>

        {/* TOTAL BOOKINGS */}

        <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">

          <div className="text-xl mb-2">
            🏟️
          </div>

          <p className="text-gray-400 text-xs mb-1">
            Total Bookings
          </p>

          <p className="text-[#111] font-bold text-2xl">
            {totalBookings}
          </p>

          <p className="text-gray-400 text-xs mt-1">
            Successful bookings
          </p>

        </div>

        {/* OCCUPANCY */}

        <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">

          <div className="text-xl mb-2">
            📈
          </div>

          <p className="text-gray-400 text-xs mb-1">
            Occupancy Rate
          </p>

          <p className="text-[#111] font-bold text-2xl">
            {occupancyRate}%
          </p>

          <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">

            <div
              className="h-full bg-[#00ff88] rounded-full transition-all"
              style={{
                width: `${Math.min(
                  100,
                  occupancyRate
                )}%`,
              }}
            />

          </div>

        </div>

      </div>

      {/* =====================================================
          POPULARITY
      ===================================================== */}

      <div className="bg-[#0f0f0f] rounded-2xl p-5 mb-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <div>

            <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
              Ground Popularity
            </p>

            <div className="flex items-center gap-3">

              <h4 className="text-white text-xl font-bold">
                {popularityLabel}
              </h4>

              <span className="text-[#00ff88] font-bold">
                {popularityScore}/100
              </span>

            </div>

            <p className="text-gray-400 text-xs mt-2 max-w-xl">
              {popularityMessage}
            </p>

          </div>

          <div className="w-full sm:w-48">

            <div className="h-3 bg-white/10 rounded-full overflow-hidden">

              <div
                className="h-full bg-[#00ff88] rounded-full transition-all"
                style={{
                  width: `${popularityScore}%`,
                }}
              />

            </div>

            <div className="flex justify-between text-[10px] text-gray-500 mt-1">

              <span>
                Low
              </span>

              <span>
                High
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          MONTHLY BOOKINGS
      ===================================================== */}

      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 sm:p-5 mb-5">

        <div className="mb-4">

          <h4 className="font-semibold text-[#111]">
            Monthly Bookings
          </h4>

          <p className="text-xs text-gray-400 mt-1">
            Booking activity over the last 6 months
          </p>

        </div>

        <div className="h-64 w-full">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <LineChart
              data={monthlyData}
              margin={{
                top: 10,
                right: 10,
                left: -20,
                bottom: 0,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="month"
                tick={{
                  fontSize: 11,
                }}
              />

              <YAxis
                allowDecimals={false}
                tick={{
                  fontSize: 11,
                }}
              />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="bookings"
                name="Bookings"
                strokeWidth={3}
                dot={{
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                }}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* =====================================================
          BOOKING TIME ANALYSIS
      ===================================================== */}

      <div className="bg-gray-50 rounded-2xl border border-gray-100 p-4 sm:p-5">

        <div className="mb-4">

          <h4 className="font-semibold text-[#111]">
            Booking Activity by Time
          </h4>

          <p className="text-xs text-gray-400 mt-1">
            See when players most often book this ground
          </p>

        </div>

        <div className="h-64 w-full">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <BarChart
              data={bookingByTime}
              margin={{
                top: 10,
                right: 10,
                left: -20,
                bottom: 0,
              }}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="period"
                tick={{
                  fontSize: 11,
                }}
              />

              <YAxis
                allowDecimals={false}
                tick={{
                  fontSize: 11,
                }}
              />

              <Tooltip />

              <Bar
                dataKey="bookings"
                name="Bookings"
                radius={[
                  6,
                  6,
                  0,
                  0,
                ]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

        {/* PEAK PERIOD */}

        <div className="mt-4 bg-white border border-gray-100 rounded-xl p-4">

          <div className="flex items-center justify-between gap-3">

            <div>

              <p className="text-gray-400 text-xs">
                Peak Booking Period
              </p>

              <p className="font-bold text-[#111] mt-1">
                {peakPeriod}
              </p>

            </div>

            <div className="text-2xl">
              🔥
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}