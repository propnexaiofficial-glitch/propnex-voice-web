import { lazy, Suspense, useEffect } from 'react'
import { useLocation } from '@/features/landing/lib/router'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import LogoMarquee from '../components/LogoMarquee'
import FeatureGrid from '../components/FeatureGrid'
import HowItWorks from '../components/HowItWorks'
import BentoGrid from '../components/BentoGrid'
import Analytics from '../components/Analytics'
import Testimonials from '../components/Testimonials'
import Pricing from '../components/Pricing'
import FAQ from '../components/FAQ'
import Footer from '../components/Footer'

const AgentPlayground = lazy(() => import('../components/AgentPlayground'))
const PhoneShowcase = lazy(() => import('../components/PhoneShowcase'))
const CompleteStack = lazy(() => import('../components/CompleteStack'))
const Solutions = lazy(() => import('../components/Solutions'))
const FeatureShowcase = lazy(() => import('../components/FeatureShowcase'))
const NetworkVisual = lazy(() => import('../components/NetworkVisual'))
const FinalCTA = lazy(() => import('../components/FinalCTA'))
const TalkToAgent = lazy(() => import('../components/TalkToAgent'))
const AIInterview = lazy(() => import('../components/AIInterview'))

function SectionFallback() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-10 w-10 animate-pulse rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 opacity-50" />
    </div>
  )
}

function ScrollToHash() {
  const { hash, pathname } = useLocation()

  useEffect(() => {
    if (!hash) {
      if (pathname === '/') window.scrollTo(0, 0)
      return
    }
    const id = hash.replace('#', '')
    const el = document.getElementById(id)
    if (el) {
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: 'smooth' })
      })
    }
  }, [hash, pathname])

  return null
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <ScrollToHash />
      <Navbar />
      <main>
        <Hero />
        <LogoMarquee />
        <FeatureGrid />
        <Suspense fallback={<SectionFallback />}>
          <AIInterview />
        </Suspense>
        <div id="playground">
          <Suspense fallback={<SectionFallback />}>
            <AgentPlayground />
          </Suspense>
        </div>
        <Suspense fallback={<SectionFallback />}>
          <PhoneShowcase />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <CompleteStack />
        </Suspense>
        <HowItWorks />
        <BentoGrid />
        <Analytics />
        <Suspense fallback={<SectionFallback />}>
          <Solutions />
          <FeatureShowcase />
          <NetworkVisual />
        </Suspense>
        <Testimonials />
        <Pricing />
        <FAQ />
        <Suspense fallback={<SectionFallback />}>
          <FinalCTA />
        </Suspense>
      </main>
      <Footer />
      <Suspense fallback={null}>
        <TalkToAgent />
      </Suspense>
    </div>
  )
}
