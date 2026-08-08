import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
// import Banner from "@/components/Banner";
import ChooseUs from "@/components/ChooseUs";
import PopularGrounds from "@/components/PopularGrounds";
import Footer from "@/components/Footer";
import Facilities from "@/components/Facilities";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <PopularGrounds />
      {/* <Banner /> */}
      {/* <Facilities /> */}
      <ChooseUs />
      <Footer />
    </>
  );
}