'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { Trophy, Target, Heart, TrendingUp, ChevronRight, Check, Users, DollarSign, Award, ArrowRight, Play, Star, Shield, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

import PremiumDashboard from '@/components/PremiumDashboard'
import DocsCenter from '@/components/DocsCenter'
import EnhancedAdminPanel from '@/components/EnhancedAdminPanel'

export default function App() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState('home')
  const { toast } = useToast()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
          setCurrentPage(data.user.role === 'ADMIN' ? 'admin' : 'dashboard')
        } else {
          localStorage.removeItem('token')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      }
    }
    setIsLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setCurrentPage('home')
    toast({ title: 'Logged out successfully' })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F9F7]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Trophy className="w-12 h-12 text-[#0F5132]" />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9F7]">
      <Toaster />
      {currentPage === 'home' && <HomePage setCurrentPage={setCurrentPage} setUser={setUser} toast={toast} />}
      {currentPage === 'docs' && <DocsCenter onBack={() => setCurrentPage('home')} />}
      {currentPage === 'dashboard' && <Dashboard user={user} handleLogout={handleLogout} toast={toast} />}
      {currentPage === 'admin' && <EnhancedAdminPanel user={user} handleLogout={handleLogout} toast={toast} />}
    </div>
  )
}

function HomePage({ setCurrentPage, setUser, toast }) {
  const [authMode, setAuthMode] = useState('login')
  const [formData, setFormData] = useState({ email: '', password: '', name: '', phone: '' })
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 1000], [0, -200])
  const y2 = useTransform(scrollY, [0, 1000], [0, -100])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/signup'
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('token', data.token)
        setUser(data.user)
        setCurrentPage(data.user.role === 'ADMIN' ? 'admin' : 'dashboard')
        toast({ title: `Welcome ${data.user.name || data.user.email}!` })
      } else {
        toast({ title: data.error || 'Authentication failed', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Network error', variant: 'destructive' })
    }
  }

  return (
    <div className="relative overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-[#0F5132]/10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0F5132] to-[#D4AF37] flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-[#2E2E2E]">Golf Prize Club</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#how" className="text-[#2E2E2E] hover:text-[#0F5132] transition-colors">How It Works</a>
            <a href="#charity" className="text-[#2E2E2E] hover:text-[#0F5132] transition-colors">Charity Impact</a>
            <a href="#prizes" className="text-[#2E2E2E] hover:text-[#0F5132] transition-colors">Prizes</a>
            <button onClick={() => setCurrentPage('docs')} className="text-[#2E2E2E] hover:text-[#0F5132] transition-colors font-medium">
              📚 Help Center
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Parallax */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Parallax Background */}
        <motion.div
          style={{ y: y1 }}
          className="absolute inset-0 z-0"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: 'url(https://images.unsplash.com/photo-1606443192517-919653213206?w=1920&q=80)',
              backgroundAttachment: 'fixed'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#F8F9F7]" />
        </motion.div>

        {/* Decorative Elements */}
        <motion.div
          style={{ y: y2 }}
          className="absolute top-40 left-20 w-72 h-72 bg-[#0F5132]/10 rounded-full blur-3xl"
        />
        <motion.div
          style={{ y: y2 }}
          className="absolute bottom-40 right-20 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl"
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              style={{ opacity }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-md rounded-full mb-8 border border-white/30"
              >
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-sm font-medium text-white">Premium Golf Membership</span>
              </motion.div>
              
              <h1 className="text-6xl lg:text-8xl font-bold text-white mb-6 leading-tight">
                Play.
                <br />
                <span className="text-[#D4AF37]">Win.</span>
                <br />
                Give Back.
              </h1>
              
              <p className="text-xl text-white/90 mb-10 leading-relaxed max-w-xl">
                Join the exclusive golf community where your performance earns monthly prizes while making a difference through charity.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <motion.a
                  href="#join"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-[#0F5132] to-[#0F5132]/80 text-white rounded-full font-semibold flex items-center gap-2 shadow-[0_10px_40px_rgba(15,81,50,0.3)] backdrop-blur-sm"
                >
                  Join the Club
                  <ArrowRight className="w-5 h-5" />
                </motion.a>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white/20 backdrop-blur-md text-white rounded-full font-semibold border border-white/30 hover:bg-white/30 transition-colors"
                >
                  Learn More
                </motion.button>
              </div>

              <div className="flex gap-8 mt-12">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                    <Trophy className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">₹1L+</div>
                    <div className="text-sm text-white/70">Monthly Prizes</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                    <Heart className="w-6 h-6 text-[#D4AF37]" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">10%+</div>
                    <div className="text-sm text-white/70">To Charity</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Auth Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              id="join"
            >
              <div className="bg-white/90 backdrop-blur-2xl rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-white/50">
                <h2 className="text-3xl font-bold text-[#2E2E2E] mb-2">Get Started</h2>
                <p className="text-[#2E2E2E]/60 mb-6">Join the club and start winning</p>
                
                <Tabs value={authMode} onValueChange={setAuthMode} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-[#F8F9F7]">
                    <TabsTrigger value="login" className="data-[state=active]:bg-[#0F5132] data-[state=active]:text-white">Login</TabsTrigger>
                    <TabsTrigger value="signup" className="data-[state=active]:bg-[#0F5132] data-[state=active]:text-white">Sign Up</TabsTrigger>
                  </TabsList>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {authMode === 'signup' && (
                      <>
                        <div>
                          <Label htmlFor="name" className="text-[#2E2E2E]">Full Name</Label>
                          <Input
                            id="name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="bg-white/50 border-[#0F5132]/20 focus:border-[#0F5132]"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone" className="text-[#2E2E2E]">Phone</Label>
                          <Input
                            id="phone"
                            placeholder="+91 9876543210"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="bg-white/50 border-[#0F5132]/20 focus:border-[#0F5132]"
                          />
                        </div>
                      </>
                    )}
                    <div>
                      <Label htmlFor="email" className="text-[#2E2E2E]">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="bg-white/50 border-[#0F5132]/20 focus:border-[#0F5132]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password" className="text-[#2E2E2E]">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        className="bg-white/50 border-[#0F5132]/20 focus:border-[#0F5132]"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-[#0F5132] to-[#0F5132]/80 hover:from-[#0F5132]/90 hover:to-[#0F5132]/70 text-white h-12 text-base font-semibold shadow-lg"
                    >
                      {authMode === 'login' ? 'Login' : 'Create Account'}
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </form>
                </Tabs>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-white/70 text-sm">Scroll to explore</span>
            <ChevronRight className="w-6 h-6 text-white/70 rotate-90" />
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Stats Section */}
      <StatsSection />

      {/* Charity Impact Section */}
      <CharitySection />

      {/* Monthly Draw Section */}
      <DrawSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* Final CTA */}
      <FinalCTA />
    </div>
  )
}

function HowItWorksSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section ref={ref} id="how" className="py-32 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[#F8F9F7] via-white to-[#F8F9F7]" />
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F5132]/10 rounded-full mb-4">
            <Play className="w-4 h-4 text-[#0F5132]" />
            <span className="text-sm font-medium text-[#0F5132]">Simple Process</span>
          </div>
          <h2 className="text-5xl font-bold text-[#2E2E2E] mb-4">How It Works</h2>
          <p className="text-xl text-[#2E2E2E]/60 max-w-2xl mx-auto">Three simple steps to start winning and giving back</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <StepCard 
            number="1" 
            title="Subscribe" 
            description="Choose your membership plan - monthly or yearly. Get instant access to all features."
            icon={Trophy}
            delay={0.2}
            isInView={isInView}
          />
          <StepCard 
            number="2" 
            title="Track Scores" 
            description="Enter your golf scores after each round. We keep your latest 5 scores for draw participation."
            icon={Target}
            delay={0.4}
            isInView={isInView}
          />
          <StepCard 
            number="3" 
            title="Win Prizes" 
            description="Join monthly draws with tiered prizes. Match 3, 4, or 5 numbers to win big!"
            icon={Award}
            delay={0.6}
            isInView={isInView}
          />
        </div>
      </div>
    </section>
  )
}

function StepCard({ number, title, description, icon: Icon, delay, isInView }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -10 }}
      className="relative group"
    >
      <div className="bg-white/40 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_rgba(15,81,50,0.15)] transition-all duration-300">
        <div className="absolute top-8 right-8 text-8xl font-bold text-[#0F5132]/5 group-hover:text-[#0F5132]/10 transition-colors">
          {number}
        </div>
        <div className="relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0F5132] to-[#0F5132]/70 flex items-center justify-center mb-6 shadow-lg">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-[#2E2E2E] mb-3">{title}</h3>
          <p className="text-[#2E2E2E]/70 leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  )
}

function StatsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  
  return (
    <section ref={ref} className="py-20 px-4 bg-gradient-to-br from-[#0F5132] to-[#0F5132]/80 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto relative z-10">
        <div className="grid md:grid-cols-4 gap-8">
          <AnimatedStat value={1250} label="Active Members" suffix="+" isInView={isInView} />
          <AnimatedStat value={50} label="Lakhs in Prizes" prefix="₹" isInView={isInView} />
          <AnimatedStat value={25} label="Lakhs Donated" prefix="₹" isInView={isInView} />
          <AnimatedStat value={48} label="Draw Winners" suffix="+" isInView={isInView} />
        </div>
      </div>
    </section>
  )
}

function AnimatedStat({ value, label, prefix = '', suffix = '', isInView }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return
    
    const duration = 2000
    const steps = 60
    const increment = value / steps
    let current = 0
    
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    
    return () => clearInterval(timer)
  }, [isInView, value])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <div className="text-5xl font-bold text-white mb-2">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="text-white/80 text-lg">{label}</div>
    </motion.div>
  )
}

function CharitySection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section ref={ref} id="charity" className="py-32 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/10 rounded-full mb-4">
            <Heart className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-sm font-medium text-[#D4AF37]">Making an Impact</span>
          </div>
          <h2 className="text-5xl font-bold text-[#2E2E2E] mb-4">Support Causes You Care About</h2>
          <p className="text-xl text-[#2E2E2E]/60 max-w-2xl mx-auto">A minimum of 10% from every subscription goes to charity. You choose where.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          <CharityCard
            name="Green Earth Foundation"
            category="Environment"
            amount="₹12L+"
            isInView={isInView}
            delay={0.1}
          />
          <CharityCard
            name="Education for All"
            category="Education"
            amount="₹8L+"
            isInView={isInView}
            delay={0.2}
          />
          <CharityCard
            name="Health Care Initiative"
            category="Healthcare"
            amount="₹5L+"
            isInView={isInView}
            delay={0.3}
          />
          <CharityCard
            name="Sports Development"
            category="Sports"
            amount="₹3L+"
            isInView={isInView}
            delay={0.4}
          />
        </div>
      </div>
    </section>
  )
}

function CharityCard({ name, category, amount, isInView, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -10, scale: 1.02 }}
      className="bg-white/40 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_rgba(212,175,55,0.15)] transition-all duration-300"
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#D4AF37]/70 flex items-center justify-center mb-4">
        <Heart className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-xl font-bold text-[#2E2E2E] mb-2">{name}</h3>
      <div className="inline-block px-3 py-1 bg-[#0F5132]/10 rounded-full text-xs font-medium text-[#0F5132] mb-4">
        {category}
      </div>
      <div className="text-2xl font-bold text-[#D4AF37]">{amount}</div>
      <div className="text-sm text-[#2E2E2E]/60">Total Donated</div>
    </motion.div>
  )
}

function DrawSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section ref={ref} id="prizes" className="py-32 px-4 bg-gradient-to-br from-[#F8F9F7] via-[#0F5132]/5 to-[#F8F9F7]">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F5132]/10 rounded-full mb-4">
            <Trophy className="w-4 h-4 text-[#0F5132]" />
            <span className="text-sm font-medium text-[#0F5132]">Monthly Jackpot</span>
          </div>
          <h2 className="text-5xl font-bold text-[#2E2E2E] mb-4">Win Big Every Month</h2>
          <p className="text-xl text-[#2E2E2E]/60 max-w-2xl mx-auto">Match numbers to win tiered prizes. The more you match, the bigger the prize!</p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/60 backdrop-blur-2xl rounded-3xl p-12 border border-white/50 shadow-[0_20px_60px_rgba(0,0,0,0.1)] mb-8"
          >
            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-[#D4AF37] mb-2">₹1,00,000</div>
              <div className="text-xl text-[#2E2E2E]/70">Current Jackpot</div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-2xl p-6 border border-[#D4AF37]/30">
                <div className="text-4xl font-bold text-[#D4AF37] mb-2">40%</div>
                <div className="text-lg font-semibold text-[#2E2E2E] mb-1">5 Match</div>
                <div className="text-sm text-[#2E2E2E]/60">₹40,000 Prize</div>
              </div>
              <div className="bg-gradient-to-br from-[#0F5132]/20 to-[#0F5132]/5 rounded-2xl p-6 border border-[#0F5132]/30">
                <div className="text-4xl font-bold text-[#0F5132] mb-2">35%</div>
                <div className="text-lg font-semibold text-[#2E2E2E] mb-1">4 Match</div>
                <div className="text-sm text-[#2E2E2E]/60">₹35,000 Prize</div>
              </div>
              <div className="bg-gradient-to-br from-[#2E2E2E]/20 to-[#2E2E2E]/5 rounded-2xl p-6 border border-[#2E2E2E]/30">
                <div className="text-4xl font-bold text-[#2E2E2E] mb-2">25%</div>
                <div className="text-lg font-semibold text-[#2E2E2E] mb-1">3 Match</div>
                <div className="text-sm text-[#2E2E2E]/60">₹25,000 Prize</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function PricingSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section ref={ref} className="py-32 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16">
          <h2 className="text-5xl font-bold text-[#2E2E2E] mb-4">Membership Plans</h2>
          <p className="text-xl text-[#2E2E2E]/60">Choose the plan that suits you best</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <PricingCard
            plan="Monthly"
            price="999"
            period="month"
            features={[
              'Monthly draw entry',
              'Score tracking (last 5)',
              'Charity selection',
              'Dashboard access',
              'Email support'
            ]}
            isInView={isInView}
            delay={0.2}
          />
          <PricingCard
            plan="Yearly"
            price="9,999"
            period="year"
            features={[
              'All monthly features',
              '12 months access',
              'Priority support',
              'Exclusive rewards',
              'Early draw notifications'
            ]}
            highlighted
            isInView={isInView}
            delay={0.3}
          />
        </div>
      </div>
    </section>
  )
}

function PricingCard({ plan, price, period, features, highlighted, isInView, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -10, scale: 1.02 }}
      className={`rounded-3xl p-8 border transition-all duration-300 ${
        highlighted
          ? 'bg-gradient-to-br from-[#0F5132] to-[#0F5132]/80 border-[#D4AF37] shadow-[0_20px_60px_rgba(15,81,50,0.3)]'
          : 'bg-white/40 backdrop-blur-xl border-white/50 shadow-[0_10px_30px_rgba(0,0,0,0.05)]'
      }`}
    >
      {highlighted && (
        <div className="inline-block px-4 py-2 bg-[#D4AF37] text-white text-sm font-semibold rounded-full mb-4">
          Best Value
        </div>
      )}
      <h3 className={`text-2xl font-bold mb-2 ${highlighted ? 'text-white' : 'text-[#2E2E2E]'}`}>{plan}</h3>
      <div className="flex items-end gap-1 mb-6">
        <span className={`text-5xl font-bold ${highlighted ? 'text-white' : 'text-[#0F5132]'}`}>₹{price}</span>
        <span className={`mb-2 ${highlighted ? 'text-white/70' : 'text-[#2E2E2E]/60'}`}>/{period}</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
              highlighted ? 'bg-[#D4AF37]' : 'bg-[#0F5132]'
            }`}>
              <Check className="w-3 h-3 text-white" />
            </div>
            <span className={highlighted ? 'text-white/90' : 'text-[#2E2E2E]/80'}>{feature}</span>
          </li>
        ))}
      </ul>
      <Button 
        className={`w-full h-12 text-base font-semibold ${
          highlighted
            ? 'bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white'
            : 'bg-[#0F5132] hover:bg-[#0F5132]/90 text-white'
        }`}
      >
        Get Started
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </motion.div>
  )
}

function FinalCTA() {
  return (
    <section className="py-32 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F5132] to-[#0F5132]/70" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6">
            Ready to Join the Club?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Start tracking your scores, winning prizes, and supporting charities today.
          </p>
          <motion.a
            href="#join"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-2 px-10 py-5 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white rounded-full font-bold text-lg shadow-[0_20px_60px_rgba(212,175,55,0.4)] transition-colors"
          >
            Join Now
            <ArrowRight className="w-6 h-6" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}

function Dashboard({ user, handleLogout, toast }) {
  const [subscription, setSubscription] = useState(null)
  const [scores, setScores] = useState([])
  const [charities, setCharities] = useState([])
  const [winners, setWinners] = useState([])
  const [userCharity, setUserCharity] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }

    try {
      const [subRes, scoresRes, charitiesRes, winnersRes, charityRes] = await Promise.all([
        fetch('/api/subscription/status', { headers }),
        fetch('/api/scores', { headers }),
        fetch('/api/charities', { headers }),
        fetch('/api/winners/my', { headers }),
        fetch('/api/user-charity', { headers }),
      ])

      if (subRes.ok) {
        const data = await subRes.json()
        setSubscription(data.subscription)
      }
      if (scoresRes.ok) {
        const data = await scoresRes.json()
        setScores(data.scores)
      }
      if (charitiesRes.ok) {
        const data = await charitiesRes.json()
        setCharities(data.charities)
      }
      if (winnersRes.ok) {
        const data = await winnersRes.json()
        setWinners(data.winners)
      }
      if (charityRes.ok) {
        const data = await charityRes.json()
        setUserCharity(data.userCharity)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    }
  }

  const handleAddScore = async (newScore) => {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          score: parseInt(newScore.score),
          scoreDate: newScore.scoreDate
        }),
      })
      if (res.ok) {
        toast({ title: 'Score added successfully' })
        fetchDashboardData()
      } else {
        const data = await res.json()
        toast({ title: data.error || 'Failed to add score', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Network error', variant: 'destructive' })
    }
  }

  const handleChangeCharity = async (charityId, contributionPercent) => {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch('/api/user-charity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ charityId, contributionPercent }),
      })
      if (res.ok) {
        toast({ title: 'Charity updated successfully!' })
        fetchDashboardData()
      } else {
        const data = await res.json()
        toast({ title: data.error || 'Failed to update charity', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Network error', variant: 'destructive' })
    }
  }

  // Show subscription CTA if no subscription
  if (!subscription) {
    return (
      <SubscriptionCTA 
        user={user} 
        handleLogout={handleLogout} 
        toast={toast}
        onSubscriptionActivated={fetchDashboardData}
      />
    )
  }

  // Show premium dashboard if subscribed
  return (
    <PremiumDashboard
      user={user}
      subscription={subscription}
      scores={scores}
      charities={charities}
      winners={winners}
      userCharity={userCharity}
      onAddScore={handleAddScore}
      onChangeCharity={handleChangeCharity}
      onLogout={handleLogout}
      onGoHome={() => setCurrentPage('home')}
      toast={toast}
    />
  )
}

function SubscriptionCTA({ user, handleLogout, toast, onSubscriptionActivated }) {
  const handleSubscribe = async (plan) => {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch('/api/subscription/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (res.ok) {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.order.amount,
          currency: data.order.currency,
          order_id: data.order.id,
          name: 'Golf Prize Club',
          description: `${plan} Subscription`,
          handler: async (response) => {
            const verifyRes = await fetch('/api/subscription/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify(response),
            })
            if (verifyRes.ok) {
              toast({ title: 'Subscription activated!' })
              if (onSubscriptionActivated) onSubscriptionActivated()
            }
          },
        }
        const rzp = new window.Razorpay(options)
        rzp.open()
      }
    } catch (error) {
      toast({ title: 'Subscription failed', variant: 'destructive' })
    }
  }

  const handleDemoSubscription = async () => {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch('/api/subscription/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) {
        toast({ 
          title: '🎉 Demo Activated!', 
          description: 'You have 7 days free access to all features' 
        })
        if (onSubscriptionActivated) onSubscriptionActivated()
      } else {
        toast({ title: data.error || 'Demo activation failed', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Network error', variant: 'destructive' })
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9F7]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-[#0F5132]/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0F5132] to-[#D4AF37] flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold text-[#2E2E2E]">Golf Prize Club</div>
              <div className="text-xs text-[#2E2E2E]/60">Member Dashboard</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium text-[#2E2E2E]">{user.name || user.email}</div>
              <div className="text-xs text-[#2E2E2E]/60">No subscription</div>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm" className="border-[#0F5132] text-[#0F5132] hover:bg-[#0F5132] hover:text-white">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ y: -20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-[#0F5132] to-[#0F5132]/80 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="px-3 py-1 bg-[#D4AF37] text-white text-xs font-semibold rounded-full">
                  Try Free Demo
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-2">Activate Your Membership</h2>
              <p className="text-white/80 mb-6">Try our 7-day free demo or choose a paid plan to start tracking scores and entering draws</p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={handleDemoSubscription} 
                  className="bg-[#D4AF37] text-white hover:bg-[#D4AF37]/90 shadow-lg"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start 7-Day Free Demo
                </Button>
                <Button 
                  onClick={() => handleSubscribe('MONTHLY')} 
                  className="bg-white text-[#0F5132] hover:bg-white/90"
                >
                  Monthly - ₹999
                </Button>
                <Button 
                  onClick={() => handleSubscribe('YEARLY')} 
                  className="bg-white/20 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30"
                >
                  Yearly - ₹9,999 <span className="ml-2 text-xs">(Save 17%)</span>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <script src="https://checkout.razorpay.com/v1/checkout.js" async />
    </div>
  )
}

// AdminPanel removed - now using EnhancedAdminPanel component
