'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Trophy, Target, Heart, Award, Activity, Zap, Shield, Clock, CheckCircle, Loader2, Home
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import WinnerProofUpload from '@/components/WinnerProofUpload'

export default function PremiumDashboard({ user, subscription, scores, charities, winners, userCharity, onAddScore, onChangeCharity, onLogout, onGoHome, toast }) {
  const [newScore, setNewScore] = useState({ score: '', scoreDate: '' })
  const [charityDialogOpen, setCharityDialogOpen] = useState(false)
  const [selectedCharityId, setSelectedCharityId] = useState(userCharity?.charityId || '')
  const [contributionPercent, setContributionPercent] = useState(userCharity?.contributionPercent || 10)
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState({
    addScore: false,
    changeCharity: false
  })
  const [activities, setActivities] = useState([
    { type: 'score', text: 'Added golf score: 42', time: '2 hours ago', icon: Target },
    { type: 'draw', text: 'Entered monthly draw', time: '1 day ago', icon: Trophy },
    { type: 'charity', text: 'Updated charity support', time: '3 days ago', icon: Heart },
    { type: 'subscription', text: 'Subscription activated', time: '1 week ago', icon: Shield },
  ])

  const totalPrizePool = 100000
  const charityContribution = subscription ? (subscription.amount * (contributionPercent / 100)).toFixed(2) : 0
  const drawsEntered = 3
  const totalWinnings = winners?.reduce((sum, w) => sum + w.prizeAmount, 0) || 0
  
  // Get pending winners that need proof upload
  const pendingWinners = winners?.filter(w => w.verificationStatus === 'PENDING' || w.verificationStatus === 'REJECTED') || []
  const approvedWinners = winners?.filter(w => w.verificationStatus === 'APPROVED') || []

  const scoreChartData = scores?.slice(0, 5).reverse().map((s) => ({
    date: new Date(s.scoreDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: s.score,
  })) || []

  const nextDrawDate = new Date()
  nextDrawDate.setDate(nextDrawDate.getDate() + 15)
  const daysUntilDraw = Math.ceil((nextDrawDate - new Date()) / (1000 * 60 * 60 * 24))

  const handleSubmitScore = async (e) => {
    e.preventDefault()
    setLoading(prev => ({ ...prev, addScore: true }))
    try {
      if (onAddScore) {
        await onAddScore(newScore)
        setNewScore({ score: '', scoreDate: '' })
      }
    } finally {
      setLoading(prev => ({ ...prev, addScore: false }))
    }
  }

  const handleCharityChange = async () => {
    setLoading(prev => ({ ...prev, changeCharity: true }))
    try {
      if (onChangeCharity) {
        await onChangeCharity(selectedCharityId, contributionPercent)
        setCharityDialogOpen(false)
      }
    } finally {
      setLoading(prev => ({ ...prev, changeCharity: false }))
    }
  }

  const currentCharity = charities?.find(c => c.id === (userCharity?.charityId || selectedCharityId)) || charities?.[0]

  return (
    <div className="min-h-screen bg-[#F8F9F7]">
      <header className="bg-white/80 backdrop-blur-lg border-b border-[#0F5132]/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <button 
            onClick={onGoHome}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0F5132] to-[#D4AF37] flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold text-[#2E2E2E]">Elite Golf Club</div>
              <div className="text-xs text-[#2E2E2E]/60">Member Dashboard</div>
            </div>
          </button>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium text-[#2E2E2E]">{user.name || user.email}</div>
              <div className="text-xs text-[#2E2E2E]/60">{subscription?.status || 'No subscription'}</div>
            </div>
            <Button onClick={onLogout} variant="outline" size="sm" className="border-[#0F5132] text-[#0F5132] hover:bg-[#0F5132] hover:text-white">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Winner Proof Upload - Show if user has pending winners */}
        {pendingWinners.length > 0 && pendingWinners.map((winner) => (
          <WinnerProofUpload 
            key={winner.id} 
            winner={winner} 
            toast={toast}
            onUploadComplete={() => setRefreshKey(prev => prev + 1)}
          />
        ))}

        {/* Top Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Subscription Status" value={subscription?.plan || 'None'} subtitle={subscription?.endDate ? `Until ${new Date(subscription.endDate).toLocaleDateString()}` : 'Not active'} icon={Shield} color="emerald" badge={subscription?.amount === 0 ? 'DEMO' : null} />
          <StatCard title="Total Prize Pool" value={`₹${totalPrizePool.toLocaleString()}`} subtitle="Current jackpot" icon={Trophy} color="amber" />
          <StatCard title="Charity Impact" value={`₹${charityContribution}`} subtitle="Your contribution" icon={Heart} color="rose" />
          <StatCard title="Draw Participation" value={drawsEntered} subtitle="Draws entered" icon={Zap} color="blue" />
        </div>

        {/* ROW 1: Activity, Scores, Next Draw - 3 equal columns */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Activity Timeline */}
          <Card className="bg-white/40 backdrop-blur-xl border border-white/50 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#2E2E2E]">
                <Activity className="w-5 h-5 text-[#0F5132]" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activities.map((activity, idx) => {
                  const Icon = activity.icon
                  return (
                    <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="flex items-center gap-3 p-3 hover:bg-white/50 rounded-lg transition-colors">
                      <div className="w-10 h-10 rounded-full bg-[#0F5132]/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-[#0F5132]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-[#2E2E2E] text-sm">{activity.text}</div>
                        <div className="text-xs text-[#2E2E2E]/60">{activity.time}</div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Golf Scores */}
          <Card className="bg-white/40 backdrop-blur-xl border border-white/50 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2 text-[#2E2E2E]">
                  <Target className="w-5 h-5 text-[#0F5132]" />
                  Golf Scores
                </CardTitle>
                <Badge variant="secondary" className="bg-[#0F5132]/10 text-[#0F5132]">{scores?.length || 0}/5</Badge>
              </div>
              <CardDescription>Track your performance</CardDescription>
            </CardHeader>
            <CardContent>
              {scoreChartData.length > 0 && (
                <div className="mb-4">
                  <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={scoreChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="date" stroke="#9CA3AF" fontSize={11} />
                      <YAxis stroke="#9CA3AF" fontSize={11} domain={[0, 45]} />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #D4AF37', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="score" stroke="#0F5132" strokeWidth={2} dot={{ fill: '#D4AF37', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
              <form onSubmit={handleSubmitScore} className="space-y-3 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="score" className="text-xs">Score (1-45)</Label>
                    <Input id="score" type="number" min="1" max="45" value={newScore.score} onChange={(e) => setNewScore({ ...newScore, score: e.target.value })} required className="h-9" />
                  </div>
                  <div>
                    <Label htmlFor="scoreDate" className="text-xs">Date</Label>
                    <Input id="scoreDate" type="date" value={newScore.scoreDate} onChange={(e) => setNewScore({ ...newScore, scoreDate: e.target.value })} required className="h-9" />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={loading.addScore}
                  className="w-full bg-[#0F5132] hover:bg-[#0F5132]/90 text-white h-9 text-sm"
                >
                  {loading.addScore ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4 mr-2" />
                      Add Score
                    </>
                  )}
                </Button>
              </form>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {scores?.slice(0, 3).map((score, idx) => (
                  <div key={score.id} className="flex justify-between items-center p-2 bg-white/50 rounded-lg text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#D4AF37]/70 flex items-center justify-center">
                        <span className="font-bold text-white text-xs">{score.score}</span>
                      </div>
                      <span className="text-xs text-[#2E2E2E]/60">{new Date(score.scoreDate).toLocaleDateString()}</span>
                    </div>
                    <Badge variant="secondary" className="bg-[#0F5132]/10 text-[#0F5132] text-xs">#{idx + 1}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Next Draw */}
          <Card className="bg-gradient-to-br from-[#0F5132] to-[#0F5132]/80 text-white border-0 shadow-[0_10px_30px_rgba(15,81,50,0.3)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg"><Trophy className="w-5 h-5" />Next Draw</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold mb-1">{daysUntilDraw}</div>
                <div className="text-sm text-white/70">days remaining</div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center pb-2 border-b border-white/20">
                  <span className="text-white/70">Prize Pool</span>
                  <span className="font-semibold text-lg">₹{totalPrizePool.toLocaleString()}</span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-white/70">5 Match</span>
                    <span className="font-semibold">40%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">4 Match</span>
                    <span className="font-semibold">35%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">3 Match</span>
                    <span className="font-semibold">25%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ROW 2: Charity Impact, Winnings - 2 equal columns */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Charity Support */}
          <Card className="bg-white/40 backdrop-blur-xl border border-white/50 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#2E2E2E] text-lg"><Heart className="w-5 h-5 text-[#D4AF37]" />Charity Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#D4AF37]/70 flex items-center justify-center mx-auto mb-2">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div className="font-bold text-[#2E2E2E] text-sm">{currentCharity?.name || 'No charity selected'}</div>
                <div className="text-xs text-[#2E2E2E]/60">{currentCharity?.category || ''}</div>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#2E2E2E]/60">Contribution</span>
                    <span className="font-semibold text-[#D4AF37]">{contributionPercent}%</span>
                  </div>
                  <Progress value={contributionPercent} className="h-2 bg-[#D4AF37]/20" />
                </div>
                <div className="flex justify-between items-center py-2 border-t border-[#0F5132]/10 text-sm">
                  <span className="text-[#2E2E2E]/60">Total Donated</span>
                  <span className="font-bold text-[#D4AF37]">₹{charityContribution}</span>
                </div>
              </div>
              <Dialog open={charityDialogOpen} onOpenChange={setCharityDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full mt-3 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white text-sm h-9">
                    Change Charity
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white">
                  <DialogHeader>
                    <DialogTitle>Select Your Charity</DialogTitle>
                    <DialogDescription>Choose a charity and set your contribution percentage (minimum 10%)</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label className="text-sm mb-2 block">Charity</Label>
                      <Select value={selectedCharityId} onValueChange={setSelectedCharityId}>
                        <SelectTrigger><SelectValue placeholder="Select charity" /></SelectTrigger>
                        <SelectContent>
                          {charities?.map((charity) => (
                            <SelectItem key={charity.id} value={charity.id}>{charity.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm mb-2 block">Contribution: {contributionPercent}%</Label>
                      <Slider value={[contributionPercent]} onValueChange={([val]) => setContributionPercent(val)} min={10} max={100} step={5} />
                      <div className="flex justify-between text-xs text-[#2E2E2E]/60 mt-1">
                        <span>10%</span>
                        <span>100%</span>
                      </div>
                    </div>
                    <Button 
                      onClick={handleCharityChange} 
                      disabled={loading.changeCharity}
                      className="w-full bg-[#D4AF37] hover:bg-[#D4AF37]/90"
                    >
                      {loading.changeCharity ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Winnings */}
          <Card className="bg-white/40 backdrop-blur-xl border border-white/50 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#2E2E2E] text-lg"><Award className="w-5 h-5 text-[#D4AF37]" />Winnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-3">
                <div className="text-2xl font-bold text-[#D4AF37]">₹{totalWinnings.toLocaleString()}</div>
                <div className="text-xs text-[#2E2E2E]/60">Total Winnings</div>
              </div>
              {winners && winners.length > 0 ? (
                <div className="space-y-2">
                  {winners.map((winner) => (
                    <div key={winner.id} className="p-2 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-lg">
                      <div className="flex justify-between items-start mb-1">
                        <Badge variant="secondary" className="bg-[#D4AF37]/20 text-[#D4AF37] border-0 text-xs">{winner.matchTier}</Badge>
                        <span className="font-bold text-[#D4AF37] text-sm">₹{winner.prizeAmount}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[#2E2E2E]/60">
                        {winner.paymentStatus === 'PAID' ? <><CheckCircle className="w-3 h-3 text-green-500" />Paid</> : <><Clock className="w-3 h-3 text-amber-500" />Pending</>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-[#2E2E2E]/60">
                  <Award className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">No winnings yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, subtitle, icon: Icon, color, badge }) {
  const colorClasses = {
    emerald: 'from-[#0F5132] to-[#0F5132]/70',
    amber: 'from-[#D4AF37] to-[#D4AF37]/70',
    rose: 'from-rose-500 to-rose-600',
    blue: 'from-blue-500 to-blue-600',
  }

  return (
    <motion.div whileHover={{ y: -5, scale: 1.02 }} className="relative p-6 bg-white/40 backdrop-blur-xl rounded-2xl border border-white/50 shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_rgba(15,81,50,0.15)] transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="text-sm text-[#2E2E2E]/60 mb-1">{title}</div>
          <div className="text-3xl font-bold text-[#2E2E2E] mb-1 flex items-center gap-2">
            {value}
            {badge && <Badge className="bg-[#D4AF37] text-white text-xs">{badge}</Badge>}
          </div>
          <div className="text-xs text-[#2E2E2E]/60">{subtitle}</div>
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  )
}
