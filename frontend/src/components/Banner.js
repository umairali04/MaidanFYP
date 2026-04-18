export default function Banner() {
  return (
    <section style={styles.banner}>
      <h2>🔥 Book More, Pay Less</h2>
      <p>Get discounts on early bookings and group matches</p>
      <button style={styles.btn}>View Offers</button>
    </section>
  );
}

const styles = {
  banner: {
    padding: "60px 20px",
    textAlign: "center",
    backgroundColor: "#111",
    color: "white",
  },
  btn: {
    marginTop: "15px",
    padding: "10px 18px",
    backgroundColor: "#00ff88",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};