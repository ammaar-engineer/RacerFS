import { ThemeProvider } from '../hooks/useTheme'
import Header from '../sections/Header'
import Hero from '../sections/Hero'
import Why from '../sections/Why'
import Architecture from '../sections/Architecture'
import Performance from '../sections/Performance'
import DevEx from '../sections/DevEx'
import Roadmap from '../sections/Roadmap'
import GitHubSection from '../sections/GitHubSection'
import Docs from '../sections/Docs'
import FAQ from '../sections/FAQ'
import Beta from '../sections/Beta'
import Legal from '../sections/Legal'
import Footer from '../sections/Footer'
import Fx from '../components/Fx'

export default function Home() {
  return (
    <ThemeProvider>
      <div className="relative min-h-screen bg-background text-foreground transition-colors duration-700">
        <a
          href="#features"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-[#232323] focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <Fx />
        <Header />
        <main>
          <Hero />
          <Why />
          <Architecture />
          <Performance />
          <DevEx />
          <Roadmap />
          <GitHubSection />
          <Docs />
          <FAQ />
          <Beta />
          <Legal />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  )
}
