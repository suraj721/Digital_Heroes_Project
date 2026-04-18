'use client'

import { motion } from 'framer-motion'
import { Trophy, Target, Heart, Shield, Award, HelpCircle, FileText, Upload } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'

export default function DocsCenter({ onBack }) {
  return (
    <div className="min-h-screen bg-[#F8F9F7]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-[#0F5132]/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0F5132] to-[#D4AF37] flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold text-[#2E2E2E]">Help Center</div>
              <div className="text-xs text-[#2E2E2E]/60">How everything works</div>
            </div>
          </div>
          {onBack && (
            <Button onClick={onBack} variant="outline" size="sm" className="border-[#0F5132] text-[#0F5132]">
              Back to Home
            </Button>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Tabs defaultValue="draw" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8 bg-white/40 backdrop-blur-xl p-1">
              <TabsTrigger value="draw" className="data-[state=active]:bg-[#0F5132] data-[state=active]:text-white">
                <Trophy className="w-4 h-4 mr-2" />Draw System
              </TabsTrigger>
              <TabsTrigger value="scores" className="data-[state=active]:bg-[#0F5132] data-[state=active]:text-white">
                <Target className="w-4 h-4 mr-2" />Scores
              </TabsTrigger>
              <TabsTrigger value="charity" className="data-[state=active]:bg-[#0F5132] data-[state=active]:text-white">
                <Heart className="w-4 h-4 mr-2" />Charity
              </TabsTrigger>
              <TabsTrigger value="subscription" className="data-[state=active]:bg-[#0F5132] data-[state=active]:text-white">
                <Shield className="w-4 h-4 mr-2" />Subscription
              </TabsTrigger>
              <TabsTrigger value="proof" className="data-[state=active]:bg-[#0F5132] data-[state=active]:text-white">
                <Upload className="w-4 h-4 mr-2" />Winner Proof
              </TabsTrigger>
            </TabsList>

            {/* Draw System */}
            <TabsContent value="draw">
              <Card className="bg-white/40 backdrop-blur-xl border border-white/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#2E2E2E]">
                    <Trophy className="w-6 h-6 text-[#D4AF37]" />
                    How the Monthly Draw Works
                  </CardTitle>
                  <CardDescription>Understanding the draw mechanics and prize distribution</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#2E2E2E] mb-3">Draw Schedule</h3>
                    <p className="text-[#2E2E2E]/80 mb-4">The monthly draw is conducted on the last day of every month at 8:00 PM IST. All active subscribers who have entered at least one golf score during the month are automatically entered into the draw.</p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[#2E2E2E] mb-3">How Numbers Are Drawn</h3>
                    <p className="text-[#2E2E2E]/80 mb-4">The system generates 5 winning numbers between 1-45. Numbers are derived from your golf scores:</p>
                    <ul className="list-disc list-inside space-y-2 text-[#2E2E2E]/80">
                      <li><strong>Random Mode:</strong> Numbers are selected completely at random</li>
                      <li><strong>Weighted Mode:</strong> Better golf scores increase your chances (lower scores = better odds)</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[#2E2E2E] mb-3">Prize Tiers & Distribution</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 rounded-xl border border-[#D4AF37]/30">
                        <div className="text-2xl font-bold text-[#D4AF37] mb-1">40%</div>
                        <div className="text-lg font-semibold text-[#2E2E2E] mb-1">5 Match</div>
                        <p className="text-sm text-[#2E2E2E]/70">Match all 5 numbers to win 40% of the total prize pool</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-[#0F5132]/20 to-[#0F5132]/5 rounded-xl border border-[#0F5132]/30">
                        <div className="text-2xl font-bold text-[#0F5132] mb-1">35%</div>
                        <div className="text-lg font-semibold text-[#2E2E2E] mb-1">4 Match</div>
                        <p className="text-sm text-[#2E2E2E]/70">Match 4 out of 5 numbers to win 35% of the prize pool</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-gray-500/20 to-gray-500/5 rounded-xl border border-gray-500/30">
                        <div className="text-2xl font-bold text-gray-600 mb-1">25%</div>
                        <div className="text-lg font-semibold text-[#2E2E2E] mb-1">3 Match</div>
                        <p className="text-sm text-[#2E2E2E]/70">Match 3 out of 5 numbers to win 25% of the prize pool</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[#2E2E2E] mb-3">Jackpot Rollover</h3>
                    <p className="text-[#2E2E2E]/80">If no one matches all 5 numbers, the 40% prize amount is rolled over to the next month's jackpot, creating even bigger prizes!</p>
                  </div>

                  <div className="bg-[#0F5132]/10 p-4 rounded-xl">
                    <h4 className="font-bold text-[#2E2E2E] mb-2">Example:</h4>
                    <p className="text-[#2E2E2E]/80">If the total prize pool is ₹1,00,000:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-[#2E2E2E]/80">
                      <li>5 Match winner gets ₹40,000</li>
                      <li>4 Match winners split ₹35,000</li>
                      <li>3 Match winners split ₹25,000</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Scores */}
            <TabsContent value="scores">
              <Card className="bg-white/40 backdrop-blur-xl border border-white/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#2E2E2E]">
                    <Target className="w-6 h-6 text-[#0F5132]" />
                    Golf Score Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#2E2E2E] mb-3">How Scoring Works</h3>
                    <p className="text-[#2E2E2E]/80 mb-4">We use the Stableford scoring system where scores range from 1 to 45 points. Lower scores indicate better performance.</p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[#2E2E2E] mb-3">Last 5 Scores Rule</h3>
                    <p className="text-[#2E2E2E]/80 mb-4">The system automatically maintains only your last 5 scores. When you add a 6th score, the oldest score is automatically removed. This ensures:</p>
                    <ul className="list-disc list-inside space-y-2 text-[#2E2E2E]/80">
                      <li>Your recent performance is always up to date</li>
                      <li>Fair draw participation based on current form</li>
                      <li>Clean and manageable score history</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[#2E2E2E] mb-3">Adding Scores</h3>
                    <ol className="list-decimal list-inside space-y-2 text-[#2E2E2E]/80">
                      <li>Enter your score (1-45)</li>
                      <li>Select the date you played</li>
                      <li>Click "Add Score"</li>
                      <li>Score is instantly added and you can see it on your performance chart</li>
                    </ol>
                  </div>

                  <div className="bg-[#0F5132]/10 p-4 rounded-xl">
                    <h4 className="font-bold text-[#2E2E2E] mb-2">Important:</h4>
                    <ul className="list-disc list-inside space-y-1 text-[#2E2E2E]/80">
                      <li>You can only have one score per date</li>
                      <li>Scores must be between 1 and 45</li>
                      <li>You must have an active subscription to add scores</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Charity */}
            <TabsContent value="charity">
              <Card className="bg-white/40 backdrop-blur-xl border border-white/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#2E2E2E]">
                    <Heart className="w-6 h-6 text-[#D4AF37]" />
                    Charity Support System
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#2E2E2E] mb-3">How It Works</h3>
                    <p className="text-[#2E2E2E]/80 mb-4">A portion of every subscription goes directly to the charity of your choice. You decide which cause to support and how much to contribute.</p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[#2E2E2E] mb-3">Contribution Rules</h3>
                    <ul className="list-disc list-inside space-y-2 text-[#2E2E2E]/80">
                      <li><strong>Minimum:</strong> 10% of your subscription amount</li>
                      <li><strong>Maximum:</strong> 100% of your subscription amount</li>
                      <li><strong>Flexibility:</strong> Change your charity or percentage anytime</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[#2E2E2E] mb-3">Selecting Your Charity</h3>
                    <ol className="list-decimal list-inside space-y-2 text-[#2E2E2E]/80">
                      <li>During signup, choose from our verified charity partners</li>
                      <li>Set your contribution percentage (minimum 10%)</li>
                      <li>Your contribution is automatically calculated from each subscription payment</li>
                      <li>You can change your charity anytime from your dashboard</li>
                    </ol>
                  </div>

                  <div className="bg-[#D4AF37]/10 p-4 rounded-xl">
                    <h4 className="font-bold text-[#2E2E2E] mb-2">Example:</h4>
                    <p className="text-[#2E2E2E]/80">If you have a ₹999 monthly subscription and set 10% contribution:</p>
                    <p className="text-[#D4AF37] font-bold mt-2">₹99.90 goes to your selected charity every month</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Subscription */}
            <TabsContent value="subscription">
              <Card className="bg-white/40 backdrop-blur-xl border border-white/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#2E2E2E]">
                    <Shield className="w-6 h-6 text-[#0F5132]" />
                    Membership Plans
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#2E2E2E] mb-3">Available Plans</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 bg-[#D4AF37]/10 rounded-xl">
                        <div className="text-xl font-bold text-[#D4AF37] mb-1">7-Day Demo</div>
                        <div className="text-2xl font-bold text-[#2E2E2E] mb-2">FREE</div>
                        <p className="text-sm text-[#2E2E2E]/70">Try all features for free for 7 days</p>
                      </div>
                      <div className="p-4 bg-[#0F5132]/10 rounded-xl">
                        <div className="text-xl font-bold text-[#0F5132] mb-1">Monthly</div>
                        <div className="text-2xl font-bold text-[#2E2E2E] mb-2">₹999</div>
                        <p className="text-sm text-[#2E2E2E]/70">Full access, renews monthly</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-[#0F5132]/20 to-[#D4AF37]/20 rounded-xl border-2 border-[#D4AF37]">
                        <div className="text-xl font-bold text-[#0F5132] mb-1">Yearly</div>
                        <div className="text-2xl font-bold text-[#2E2E2E] mb-2">₹9,999</div>
                        <p className="text-sm text-[#2E2E2E]/70">Save 17%! Best value</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[#2E2E2E] mb-3">What's Included</h3>
                    <ul className="list-disc list-inside space-y-2 text-[#2E2E2E]/80">
                      <li>Automatic entry into monthly draws</li>
                      <li>Score tracking and performance charts</li>
                      <li>Charity selection and contribution tracking</li>
                      <li>Priority customer support</li>
                      <li>Access to all platform features</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Winner Proof */}
            <TabsContent value="proof">
              <Card className="bg-white/40 backdrop-blur-xl border border-white/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#2E2E2E]">
                    <Upload className="w-6 h-6 text-[#D4AF37]" />
                    Winner Verification Process
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#2E2E2E] mb-3">Why Proof is Required</h3>
                    <p className="text-[#2E2E2E]/80 mb-4">To ensure fairness and verify authenticity, winners must submit proof of their golf scores before receiving prize money.</p>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[#2E2E2E] mb-3">What to Submit</h3>
                    <p className="text-[#2E2E2E]/80 mb-4">Upload a screenshot or photo showing:</p>
                    <ul className="list-disc list-inside space-y-2 text-[#2E2E2E]/80">
                      <li>Your golf scorecard from the platform you play on</li>
                      <li>Clearly visible date and score</li>
                      <li>Your player name/ID</li>
                      <li>Must match the scores you entered in our system</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[#2E2E2E] mb-3">Verification Steps</h3>
                    <ol className="list-decimal list-inside space-y-2 text-[#2E2E2E]/80">
                      <li><strong>Win a Draw:</strong> You'll receive notification if you win</li>
                      <li><strong>Upload Proof:</strong> Submit your golf platform screenshot</li>
                      <li><strong>Admin Review:</strong> Our team verifies within 2-3 business days</li>
                      <li><strong>Approval:</strong> Once approved, payment is processed</li>
                      <li><strong>Payment:</strong> Prize money transferred to your account</li>
                    </ol>
                  </div>

                  <div className="bg-[#D4AF37]/10 p-4 rounded-xl">
                    <h4 className="font-bold text-[#2E2E2E] mb-2">Important Notes:</h4>
                    <ul className="list-disc list-inside space-y-1 text-[#2E2E2E]/80">
                      <li>Proof must be submitted within 7 days of winning</li>
                      <li>Screenshots must be clear and readable</li>
                      <li>Fraudulent submissions result in account suspension</li>
                      <li>Payments processed within 5-7 business days after approval</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-[#2E2E2E] mb-3">Acceptable Proof Examples</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 bg-white/50 rounded-xl text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                          <Award className="w-8 h-8 text-green-600" />
                        </div>
                        <p className="text-sm font-semibold text-[#2E2E2E]">Golf App Screenshot</p>
                      </div>
                      <div className="p-4 bg-white/50 rounded-xl text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                          <Award className="w-8 h-8 text-green-600" />
                        </div>
                        <p className="text-sm font-semibold text-[#2E2E2E]">Physical Scorecard Photo</p>
                      </div>
                      <div className="p-4 bg-white/50 rounded-xl text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                          <Award className="w-8 h-8 text-green-600" />
                        </div>
                        <p className="text-sm font-semibold text-[#2E2E2E]">Course System Screenshot</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
