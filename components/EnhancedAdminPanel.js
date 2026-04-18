'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Users, TrendingUp, Award, Target, Heart, Plus, Edit, Trash, Check, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function EnhancedAdminPanel({ user, handleLogout, toast }) {
  const [analytics, setAnalytics] = useState(null)
  const [users, setUsers] = useState([])
  const [winners, setWinners] = useState([])
  const [charities, setCharities] = useState([])
  const [draws, setDraws] = useState([])
  const [lastDrawResult, setLastDrawResult] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [charityDialog, setCharityDialog] = useState(false)
  const [newCharity, setNewCharity] = useState({ name: '', description: '', category: '', imageUrl: '', websiteUrl: '', isFeatured: false })
  const [loading, setLoading] = useState({
    randomDraw: false,
    weightedDraw: false,
    verifying: {},
    markingPaid: {}
  })

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}` }

    try {
      const [analyticsRes, usersRes, winnersRes, charitiesRes, drawsRes] = await Promise.all([
        fetch('/api/admin/analytics', { headers }),
        fetch('/api/admin/users', { headers }),
        fetch('/api/admin/winners', { headers }),
        fetch('/api/admin/charities', { headers }),
        fetch('/api/draws', { headers }),
      ])

      if (analyticsRes.ok) setAnalytics(await analyticsRes.json())
      if (usersRes.ok) setUsers((await usersRes.json()).users)
      if (winnersRes.ok) setWinners((await winnersRes.json()).winners)
      if (charitiesRes.ok) setCharities((await charitiesRes.json()).charities)
      if (drawsRes.ok) setDraws((await drawsRes.json()).draws)
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
    }
  }

  const handleRunDraw = async (mode) => {
    const loadingKey = mode === 'RANDOM' ? 'randomDraw' : 'weightedDraw'
    setLoading(prev => ({ ...prev, [loadingKey]: true }))
    
    const token = localStorage.getItem('token')
    try {
      const res = await fetch('/api/admin/draw/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ drawMode: mode }),
      })
      if (res.ok) {
        const result = await res.json()
        setLastDrawResult(result)
        toast({ 
          title: `✅ Draw completed in ${mode} mode!`,
          description: `${result.summary.fiveMatch} 5-match, ${result.summary.fourMatch} 4-match, ${result.summary.threeMatch} 3-match winners`
        })
        fetchAdminData()
      } else {
        const error = await res.json()
        toast({ title: error.error || 'Draw failed', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Draw failed', variant: 'destructive' })
    } finally {
      setLoading(prev => ({ ...prev, [loadingKey]: false }))
    }
  }

  const handleAddCharity = async () => {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch('/api/admin/charity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newCharity),
      })
      if (res.ok) {
        toast({ title: 'Charity added successfully!' })
        setCharityDialog(false)
        setNewCharity({ name: '', description: '', category: '', imageUrl: '', websiteUrl: '', isFeatured: false })
        fetchAdminData()
      }
    } catch (error) {
      toast({ title: 'Failed to add charity', variant: 'destructive' })
    }
  }

  const handleDeleteCharity = async (id) => {
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`/api/admin/charity/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        toast({ title: 'Charity deleted' })
        fetchAdminData()
      }
    } catch (error) {
      toast({ title: 'Failed to delete', variant: 'destructive' })
    }
  }

  const handleVerifyWinner = async (winnerId, status) => {
    setLoading(prev => ({ ...prev, verifying: { ...prev.verifying, [winnerId]: status } }))
    
    const token = localStorage.getItem('token')
    try {
      const res = await fetch('/api/admin/winner/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ winnerId, status }),
      })
      if (res.ok) {
        toast({ title: `Winner ${status.toLowerCase()}!` })
        fetchAdminData()
      }
    } catch (error) {
      toast({ title: 'Verification failed', variant: 'destructive' })
    } finally {
      setLoading(prev => ({ ...prev, verifying: { ...prev.verifying, [winnerId]: false } }))
    }
  }

  const handleMarkPaid = async (winnerId) => {
    setLoading(prev => ({ ...prev, markingPaid: { ...prev.markingPaid, [winnerId]: true } }))
    
    const token = localStorage.getItem('token')
    try {
      const res = await fetch('/api/admin/winner/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ winnerId }),
      })
      if (res.ok) {
        toast({ title: 'Marked as paid!' })
        fetchAdminData()
      }
    } catch (error) {
      toast({ title: 'Update failed', variant: 'destructive' })
    } finally {
      setLoading(prev => ({ ...prev, markingPaid: { ...prev.markingPaid, [winnerId]: false } }))
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    
    setLoading(prev => ({ ...prev, deletingUser: { ...prev.deletingUser, [userId]: true } }))
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`/api/admin/user/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        toast({ title: 'User deleted successfully' })
        fetchAdminData()
      } else {
        toast({ title: 'Delete failed', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Network error', variant: 'destructive' })
    } finally {
      setLoading(prev => ({ ...prev, deletingUser: { ...prev.deletingUser, [userId]: false } }))
    }
  }

  const handleToggleUserStatus = async (userId, currentStatus) => {
    setLoading(prev => ({ ...prev, togglingUser: { ...prev.togglingUser, [userId]: true } }))
    const token = localStorage.getItem('token')
    try {
      const res = await fetch(`/api/admin/user/${userId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: !currentStatus }),
      })
      if (res.ok) {
        toast({ title: `User ${!currentStatus ? 'activated' : 'deactivated'}` })
        fetchAdminData()
      }
    } catch (error) {
      toast({ title: 'Update failed', variant: 'destructive' })
    } finally {
      setLoading(prev => ({ ...prev, togglingUser: { ...prev.togglingUser, [userId]: false } }))
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9F7] flex">
      {/* Sidebar */}
      <div className="w-64 bg-white/80 backdrop-blur-lg border-r border-[#0F5132]/10 p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0F5132] to-[#D4AF37] flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div className="font-bold text-[#2E2E2E]">Admin Panel</div>
        </div>

        <nav className="space-y-2">
          <button onClick={() => setActiveTab('overview')} className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${activeTab === 'overview' ? 'bg-[#0F5132] text-white' : 'text-[#2E2E2E] hover:bg-[#0F5132]/10'}`}>
            <TrendingUp className="w-4 h-4 inline mr-2" />Overview
          </button>
          <button onClick={() => setActiveTab('users')} className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${activeTab === 'users' ? 'bg-[#0F5132] text-white' : 'text-[#2E2E2E] hover:bg-[#0F5132]/10'}`}>
            <Users className="w-4 h-4 inline mr-2" />Users
          </button>
          <button onClick={() => setActiveTab('draws')} className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${activeTab === 'draws' ? 'bg-[#0F5132] text-white' : 'text-[#2E2E2E] hover:bg-[#0F5132]/10'}`}>
            <Trophy className="w-4 h-4 inline mr-2" />Draws
          </button>
          <button onClick={() => setActiveTab('winners')} className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${activeTab === 'winners' ? 'bg-[#0F5132] text-white' : 'text-[#2E2E2E] hover:bg-[#0F5132]/10'}`}>
            <Award className="w-4 h-4 inline mr-2" />Winners
          </button>
          <button onClick={() => setActiveTab('charities')} className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${activeTab === 'charities' ? 'bg-[#0F5132] text-white' : 'text-[#2E2E2E] hover:bg-[#0F5132]/10'}`}>
            <Heart className="w-4 h-4 inline mr-2" />Charities
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-[#0F5132]/10">
          <div className="text-xs text-[#2E2E2E]/60 mb-2">{user.email}</div>
          <Button onClick={handleLogout} variant="outline" size="sm" className="w-full border-[#0F5132] text-[#0F5132] hover:bg-[#0F5132] hover:text-white">
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'overview' && analytics && (
          <div>
            <h1 className="text-3xl font-bold text-[#2E2E2E] mb-8">Dashboard Overview</h1>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <StatCard title="Total Users" value={analytics.totalUsers} icon={Users} color="emerald" />
              <StatCard title="Active Subs" value={analytics.activeSubscriptions} icon={Trophy} color="amber" />
              <StatCard title="Total Draws" value={analytics.totalDraws} icon={Target} color="blue" />
              <StatCard title="Charities" value={analytics.totalCharities} icon={Heart} color="rose" />
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h1 className="text-3xl font-bold text-[#2E2E2E] mb-8">User Management</h1>
            <Card className="bg-white/40 backdrop-blur-xl border border-white/50">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#0F5132]/10">
                        <th className="text-left p-4 text-[#2E2E2E] font-semibold">Email</th>
                        <th className="text-left p-4 text-[#2E2E2E] font-semibold">Name</th>
                        <th className="text-left p-4 text-[#2E2E2E] font-semibold">Role</th>
                        <th className="text-left p-4 text-[#2E2E2E] font-semibold">Status</th>
                        <th className="text-left p-4 text-[#2E2E2E] font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-[#0F5132]/5 hover:bg-white/30">
                          <td className="p-4 text-[#2E2E2E]">{u.email}</td>
                          <td className="p-4 text-[#2E2E2E]">{u.name || '-'}</td>
                          <td className="p-4">
                            <Badge variant="secondary" className="bg-[#0F5132]/10 text-[#0F5132]">
                              {u.role}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Badge variant="secondary" className={u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                              {u.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggleUserStatus(u.id, u.isActive)}
                                disabled={loading.togglingUser?.[u.id] || u.role === 'ADMIN'}
                                className="h-8"
                              >
                                {loading.togglingUser?.[u.id] ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : u.isActive ? (
                                  'Deactivate'
                                ) : (
                                  'Activate'
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteUser(u.id)}
                                disabled={loading.deletingUser?.[u.id] || u.role === 'ADMIN'}
                                className="h-8"
                              >
                                {loading.deletingUser?.[u.id] ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Trash className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'draws' && (
          <div>
            <h1 className="text-3xl font-bold text-[#2E2E2E] mb-8">Draw Management</h1>
            
            {/* Run Draw Section */}
            <Card className="bg-white/40 backdrop-blur-xl border border-white/50 mb-6">
              <CardHeader>
                <CardTitle>Run Monthly Draw</CardTitle>
                <CardDescription>Choose draw mode and execute</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Button 
                  onClick={() => handleRunDraw('RANDOM')} 
                  disabled={loading.randomDraw}
                  className="bg-[#0F5132] hover:bg-[#0F5132]/90"
                >
                  {loading.randomDraw ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Running Draw...
                    </>
                  ) : (
                    <>
                      <Trophy className="w-4 h-4 mr-2" />
                      Random Draw
                    </>
                  )}
                </Button>
                <Button 
                  onClick={() => handleRunDraw('WEIGHTED')} 
                  disabled={loading.weightedDraw}
                  className="bg-[#D4AF37] hover:bg-[#D4AF37]/90"
                >
                  {loading.weightedDraw ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Running Draw...
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4 mr-2" />
                      Weighted Draw
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Last Draw Result */}
            {lastDrawResult && (
              <Card className="bg-gradient-to-br from-[#0F5132]/10 to-[#D4AF37]/10 backdrop-blur-xl border-2 border-[#D4AF37] mb-6">
                <CardHeader>
                  <CardTitle className="text-2xl">🎉 Latest Draw Results</CardTitle>
                  <CardDescription>Winning Numbers & Winners</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-[#2E2E2E] mb-3">Winning Numbers:</h3>
                    <div className="flex gap-3">
                      {lastDrawResult.winningNumbers.map((num, idx) => (
                        <div key={idx} className="w-14 h-14 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#D4AF37]/70 flex items-center justify-center shadow-lg">
                          <span className="text-2xl font-bold text-white">{num}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/60 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-[#D4AF37]">{lastDrawResult.summary.fiveMatch}</div>
                      <div className="text-sm text-[#2E2E2E]/70">5 Match Winners</div>
                    </div>
                    <div className="bg-white/60 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-[#0F5132]">{lastDrawResult.summary.fourMatch}</div>
                      <div className="text-sm text-[#2E2E2E]/70">4 Match Winners</div>
                    </div>
                    <div className="bg-white/60 rounded-xl p-4 text-center">
                      <div className="text-3xl font-bold text-[#2E2E2E]">{lastDrawResult.summary.threeMatch}</div>
                      <div className="text-sm text-[#2E2E2E]/70">3 Match Winners</div>
                    </div>
                  </div>

                  {lastDrawResult.winners.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-[#2E2E2E] mb-3">Winners:</h3>
                      <div className="space-y-3">
                        {lastDrawResult.winners.map((winner) => (
                          <div key={winner.id} className="bg-white/80 rounded-lg p-4 flex justify-between items-center">
                            <div>
                              <div className="font-semibold text-[#2E2E2E]">{winner.user.email}</div>
                              <div className="text-sm text-[#2E2E2E]/60">
                                Matched: {JSON.parse(winner.userNumbers).join(', ')}
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className="bg-[#D4AF37] mb-1">{winner.matchTier.replace('_', ' ')}</Badge>
                              <div className="text-xl font-bold text-[#0F5132]">₹{winner.prizeAmount.toLocaleString()}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Past Draws */}
            <Card className="bg-white/40 backdrop-blur-xl border border-white/50">
              <CardHeader>
                <CardTitle>Past Draws</CardTitle>
                <CardDescription>Historical draw records</CardDescription>
              </CardHeader>
              <CardContent>
                {draws.length === 0 ? (
                  <p className="text-center text-[#2E2E2E]/60 py-8">No draws yet</p>
                ) : (
                  <div className="space-y-3">
                    {draws.map((draw) => (
                      <div key={draw.id} className="bg-white/60 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-semibold text-[#2E2E2E]">
                              {new Date(draw.drawDate).toLocaleDateString()}
                            </div>
                            <Badge variant="secondary" className="mt-1">{draw.drawMode}</Badge>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-[#2E2E2E]/60">Prize Pool</div>
                            <div className="font-bold text-[#D4AF37]">₹{draw.totalPrizePool.toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          {JSON.parse(draw.winningNumbers).map((num, idx) => (
                            <div key={idx} className="w-10 h-10 rounded-full bg-[#0F5132]/10 flex items-center justify-center">
                              <span className="text-sm font-bold text-[#0F5132]">{num}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'winners' && (
          <div>
            <h1 className="text-3xl font-bold text-[#2E2E2E] mb-8">Winner Verification</h1>
            <Card className="bg-white/40 backdrop-blur-xl border border-white/50">
              <CardContent className="p-0">
                {winners.length === 0 ? (
                  <div className="text-center py-12 text-[#2E2E2E]/60">No winners yet</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#0F5132]/10">
                          <th className="text-left p-4">User</th>
                          <th className="text-left p-4">Proof</th>
                          <th className="text-left p-4">Winning Numbers</th>
                          <th className="text-left p-4">Tier</th>
                          <th className="text-left p-4">Amount</th>
                          <th className="text-left p-4">Verification</th>
                          <th className="text-left p-4">Payment</th>
                          <th className="text-left p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {winners.map((w) => (
                          <tr key={w.id} className="border-b border-[#0F5132]/5 hover:bg-white/30">
                            <td className="p-4">
                              <div className="font-medium">{w.user.email}</div>
                              {w.user.name && <div className="text-sm text-[#2E2E2E]/60">{w.user.name}</div>}
                            </td>
                            <td className="p-4">
                              {w.proofUrl ? (
                                <a href={w.proofUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  <img src={w.proofUrl} alt="Proof" className="w-16 h-16 object-cover rounded border" />
                                </a>
                              ) : (
                                <span className="text-xs text-[#2E2E2E]/40">No proof</span>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex gap-1">
                                {JSON.parse(w.userNumbers).map((num, idx) => (
                                  <div key={idx} className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                                    <span className="text-xs font-bold text-[#D4AF37]">{num}</span>
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge variant="secondary" className="bg-[#0F5132]/10 text-[#0F5132]">
                                {w.matchTier.replace('_', ' ')}
                              </Badge>
                            </td>
                            <td className="p-4 font-bold text-[#D4AF37]">₹{w.prizeAmount.toLocaleString()}</td>
                            <td className="p-4"><Badge variant="secondary">{w.verificationStatus}</Badge></td>
                            <td className="p-4"><Badge variant="secondary">{w.paymentStatus}</Badge></td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                {w.verificationStatus === 'PENDING' && w.proofUrl && (
                                  <>
                                    <Button 
                                      size="sm" 
                                      onClick={() => handleVerifyWinner(w.id, 'APPROVED')} 
                                      disabled={loading.verifying[w.id]}
                                      className="bg-green-500 hover:bg-green-600 h-8"
                                    >
                                      {loading.verifying[w.id] === 'APPROVED' ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <Check className="w-3 h-3" />
                                      )}
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      onClick={() => handleVerifyWinner(w.id, 'REJECTED')} 
                                      disabled={loading.verifying[w.id]}
                                      variant="destructive" 
                                      className="h-8"
                                    >
                                      {loading.verifying[w.id] === 'REJECTED' ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <X className="w-3 h-3" />
                                      )}
                                    </Button>
                                  </>
                                )}
                                {w.verificationStatus === 'APPROVED' && w.paymentStatus === 'PENDING' && (
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleMarkPaid(w.id)} 
                                    disabled={loading.markingPaid[w.id]}
                                    className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 h-8"
                                  >
                                    {loading.markingPaid[w.id] ? (
                                      <>
                                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                        Processing...
                                      </>
                                    ) : (
                                      'Mark Paid'
                                    )}
                                  </Button>
                                )}
                                {w.verificationStatus === 'PENDING' && !w.proofUrl && (
                                  <span className="text-xs text-amber-600">Awaiting proof</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'charities' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-[#2E2E2E]">Charity Management</h1>
              <Dialog open={charityDialog} onOpenChange={setCharityDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-[#D4AF37] hover:bg-[#D4AF37]/90"><Plus className="w-4 h-4 mr-2" />Add Charity</Button>
                </DialogTrigger>
                <DialogContent className="bg-white">
                  <DialogHeader>
                    <DialogTitle>Add New Charity</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div><Label>Name</Label><Input value={newCharity.name} onChange={(e) => setNewCharity({...newCharity, name: e.target.value})} /></div>
                    <div><Label>Description</Label><Textarea value={newCharity.description} onChange={(e) => setNewCharity({...newCharity, description: e.target.value})} /></div>
                    <div><Label>Category</Label><Input value={newCharity.category} onChange={(e) => setNewCharity({...newCharity, category: e.target.value})} /></div>
                    <Button onClick={handleAddCharity} className="w-full bg-[#D4AF37]">Add Charity</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {charities.map((charity) => (
                <Card key={charity.id} className="bg-white/40 backdrop-blur-xl border border-white/50">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{charity.name}</CardTitle>
                        <CardDescription>{charity.category}</CardDescription>
                      </div>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteCharity(charity.id)}><Trash className="w-4 h-4" /></Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-[#2E2E2E]/70">{charity.description}</p>
                    {charity.isFeatured && <Badge className="mt-2 bg-[#D4AF37]">Featured</Badge>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }) {
  const colors = { emerald: 'from-[#0F5132]', amber: 'from-[#D4AF37]', blue: 'from-blue-500', rose: 'from-rose-500' }
  return (
    <Card className="bg-white/40 backdrop-blur-xl border border-white/50">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-[#2E2E2E]/60">{title}</p>
            <p className="text-3xl font-bold text-[#2E2E2E] mt-2">{value}</p>
          </div>
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} to-${color}-600 flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
