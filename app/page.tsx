import Header from "@/components/header"
import HeroContent from "@/components/hero-content"
import ShaderBackground from "@/components/shader-background"
import Services from "@/components/services"
import CatalogTeaser from "@/components/catalog-teaser"
import About from "@/components/about"
import Contact from "@/components/contact"
import Footer from "@/components/footer"
import StickyHeader from "@/components/sticky-header"

export default function Home() {
  return (
    <>
      <StickyHeader watch="#inicio" />
      <main id="contenido" tabIndex={-1} className="outline-none">
      <ShaderBackground>
        <Header />
        <HeroContent />
      </ShaderBackground>

      <div className="relative isolate overflow-hidden bg-black">

        <Services />

        <CatalogTeaser />

        <About />
        <Contact />
      </div>
      </main>
      <Footer />
    </>
  )
}
