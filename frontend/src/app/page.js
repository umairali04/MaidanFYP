import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Banner from "@/components/Banner";
import ChooseUs from "@/components/ChooseUs";
import PopularGrounds from "@/components/PopularGrounds";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <PopularGrounds />
      <Banner />
      <ChooseUs />
      <Footer />
    </>
  );
}