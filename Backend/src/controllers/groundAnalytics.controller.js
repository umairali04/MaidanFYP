import prisma from "../utils/prisma.js";

function getMonthStart(date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    1
  );
}

function getNextMonthStart(date) {
  return new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    1
  );
}

function getMonthsBack(date, numberOfMonths) {
  return new Date(
    date.getFullYear(),
    date.getMonth() - numberOfMonths,
    1
  );
}

function formatMonth(date) {
  return date.toLocaleString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function getTimePeriod(startTime) {
  if (!startTime) return "Other";

  const hour = Number(
    String(startTime).split(":")[0]
  );

  if (hour >= 6 && hour < 12) {
    return "Morning";
  }

  if (hour >= 12 && hour < 17) {
    return "Afternoon";
  }

  if (hour >= 17 && hour < 21) {
    return "Evening";
  }

  return "Night";
}

function timeToMinutes(time) {
  if (!time) return 0;

  const [hours, minutes] = String(time)
    .split(":")
    .map(Number);

  return hours * 60 + minutes;
}

export const getGroundAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: "Ground ID is required",
      });
    }

    // =====================================================
    // FIND GROUND
    // =====================================================

    const ground = await prisma.ground.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        pricePerHour: true,
        openTime: true,
        closeTime: true,
        slotDuration: true,
        isActive: true,
      },
    });

    if (!ground) {
      return res.status(404).json({
        message: "Ground not found",
      });
    }

    // =====================================================
    // DATE RANGE
    // =====================================================

    const now = new Date();

    const currentMonthStart =
      getMonthStart(now);

    const nextMonthStart =
      getNextMonthStart(now);

    // Last 6 months
    const sixMonthsAgo =
      getMonthsBack(now, 5);

    // =====================================================
    // GET BOOKINGS
    // =====================================================

    const bookings =
      await prisma.booking.findMany({
        where: {
          groundId: id,

          status: {
            in: [
              "CONFIRMED",
              "COMPLETED",
            ],
          },

          bookingDate: {
            gte: sixMonthsAgo,
            lt: nextMonthStart,
          },
        },

        select: {
          id: true,
          bookingDate: true,
          startTime: true,
          endTime: true,
          duration: true,
          totalPrice: true,
          status: true,
        },

        orderBy: {
          bookingDate: "asc",
        },
      });

    // =====================================================
    // TOTAL BOOKINGS
    // =====================================================

    const totalBookings =
      bookings.length;

    // =====================================================
    // TOTAL REVENUE
    // =====================================================

    const totalRevenue =
      bookings.reduce(
        (sum, booking) =>
          sum +
          Number(
            booking.totalPrice || 0
          ),
        0
      );

    // =====================================================
    // CURRENT MONTH BOOKINGS
    // =====================================================

    const currentMonthBookings =
      bookings.filter((booking) => {
        const date =
          new Date(booking.bookingDate);

        return (
          date >= currentMonthStart &&
          date < nextMonthStart
        );
      });

    const bookingsThisMonth =
      currentMonthBookings.length;

    // =====================================================
    // CURRENT MONTH REVENUE
    // =====================================================

    const revenueThisMonth =
      currentMonthBookings.reduce(
        (sum, booking) =>
          sum +
          Number(
            booking.totalPrice || 0
          ),
        0
      );

    // =====================================================
    // MONTHLY DATA
    // =====================================================

    const monthlyData = [];

    for (let i = 5; i >= 0; i--) {
      const monthStart =
        new Date(
          now.getFullYear(),
          now.getMonth() - i,
          1
        );

      const monthEnd =
        new Date(
          now.getFullYear(),
          now.getMonth() - i + 1,
          1
        );

      const monthBookings =
        bookings.filter((booking) => {
          const bookingDate =
            new Date(
              booking.bookingDate
            );

          return (
            bookingDate >= monthStart &&
            bookingDate < monthEnd
          );
        });

      const monthRevenue =
        monthBookings.reduce(
          (sum, booking) =>
            sum +
            Number(
              booking.totalPrice || 0
            ),
          0
        );

      monthlyData.push({
        month:
          formatMonth(monthStart),

        bookings:
          monthBookings.length,

        revenue:
          monthRevenue,
      });
    }

    // =====================================================
    // BOOKING TIME ANALYSIS
    // =====================================================

    const timePeriods = {
      Morning: 0,
      Afternoon: 0,
      Evening: 0,
      Night: 0,
    };

    bookings.forEach((booking) => {
      const period =
        getTimePeriod(
          booking.startTime
        );

      if (
        timePeriods[period] !==
        undefined
      ) {
        timePeriods[period]++;
      }
    });

    const bookingByTime =
      Object.entries(
        timePeriods
      ).map(
        ([period, count]) => ({
          period,
          bookings: count,
        })
      );

    // =====================================================
    // PEAK PERIOD
    // =====================================================

    let peakPeriod = "No data";

    if (totalBookings > 0) {
      peakPeriod =
        bookingByTime.reduce(
          (highest, current) =>
            current.bookings >
            highest.bookings
              ? current
              : highest
        ).period;
    }

    // =====================================================
    // OCCUPANCY RATE
    // =====================================================

    const openMinutes =
      timeToMinutes(
        ground.openTime
      );

    const closeMinutes =
      timeToMinutes(
        ground.closeTime
      );

    const slotDuration =
      Number(
        ground.slotDuration
      ) || 60;

    const slotsPerDay =
      Math.max(
        0,
        Math.floor(
          (closeMinutes -
            openMinutes) /
            slotDuration
        )
      );

    const year =
      now.getFullYear();

    const month =
      now.getMonth();

    const daysInCurrentMonth =
      new Date(
        year,
        month + 1,
        0
      ).getDate();

    const totalAvailableSlots =
      slotsPerDay *
      daysInCurrentMonth;

    const bookedHoursThisMonth =
      currentMonthBookings.reduce(
        (sum, booking) =>
          sum +
          Number(
            booking.duration || 0
          ),
        0
      );

    const totalAvailableHours =
      (totalAvailableSlots *
        slotDuration) /
      60;

    let occupancyRate = 0;

    if (
      totalAvailableHours > 0
    ) {
      occupancyRate =
        (bookedHoursThisMonth /
          totalAvailableHours) *
        100;
    }

    occupancyRate = Math.min(
      100,
      Math.max(
        0,
        occupancyRate
      )
    );

    occupancyRate = Number(
      occupancyRate.toFixed(1)
    );

    // =====================================================
    // POPULARITY SCORE
    // =====================================================

    const monthlyBookingScore =
      Math.min(
        40,
        bookingsThisMonth * 2
      );

    const occupancyScore =
      Math.min(
        40,
        occupancyRate * 0.4
      );

    const thirtyDaysAgo =
      new Date();

    thirtyDaysAgo.setDate(
      thirtyDaysAgo.getDate() -
        30
    );

    const recentBookings =
      bookings.filter(
        (booking) => {
          const bookingDate =
            new Date(
              booking.bookingDate
            );

          return (
            bookingDate >=
            thirtyDaysAgo
          );
        }
      ).length;

    const recentActivityScore =
      Math.min(
        20,
        recentBookings
      );

    const popularityScore =
      Math.min(
        100,
        Math.round(
          monthlyBookingScore +
            occupancyScore +
            recentActivityScore
        )
      );

    // =====================================================
    // POPULARITY LABEL
    // =====================================================

    let popularityLabel =
      "Low Activity";

    if (
      popularityScore >= 75
    ) {
      popularityLabel =
        "Very Popular";
    } else if (
      popularityScore >= 50
    ) {
      popularityLabel =
        "Popular";
    } else if (
      popularityScore >= 25
    ) {
      popularityLabel =
        "Moderately Popular";
    }

    // =====================================================
    // BOOKING GROWTH
    // =====================================================

    const previousMonthStart =
      new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );

    const previousMonthEnd =
      currentMonthStart;

    const previousMonthBookings =
      bookings.filter(
        (booking) => {
          const date =
            new Date(
              booking.bookingDate
            );

          return (
            date >=
              previousMonthStart &&
            date <
              previousMonthEnd
          );
        }
      ).length;

    let bookingGrowth = 0;

    if (
      previousMonthBookings > 0
    ) {
      bookingGrowth =
        ((bookingsThisMonth -
          previousMonthBookings) /
          previousMonthBookings) *
        100;
    } else if (
      bookingsThisMonth > 0
    ) {
      bookingGrowth = 100;
    }

    bookingGrowth = Number(
      bookingGrowth.toFixed(1)
    );

    // =====================================================
    // RESPONSE
    // =====================================================

    return res.status(200).json({
      success: true,

      analytics: {
        bookingsThisMonth,

        totalBookings,

        revenueThisMonth,

        totalRevenue,

        occupancyRate,

        popularityScore,

        popularityLabel,

        peakPeriod,

        bookingGrowth,

        monthlyData,

        bookingByTime,
      },
    });
  } catch (error) {
    console.error(
      "GROUND ANALYTICS ERROR:",
      error
    );

    return res.status(500).json({
      message:
        "Failed to load ground analytics",

      error: error.message,
    });
  }
};