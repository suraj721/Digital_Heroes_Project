'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, CheckCircle, AlertCircle, Clock, FileImage } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function WinnerProofUpload({ winner, onUploadComplete, toast }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(winner.proofUrl || null)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: 'File too large', description: 'Maximum size is 5MB', variant: 'destructive' })
        return
      }
      if (!file.type.startsWith('image/')) {
        toast({ title: 'Invalid file type', description: 'Please upload an image', variant: 'destructive' })
        return
      }
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setPreviewUrl(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({ title: 'No file selected', variant: 'destructive' })
      return
    }

    setUploading(true)
    const token = localStorage.getItem('token')
    const formData = new FormData()
    formData.append('proof', selectedFile)
    formData.append('winnerId', winner.id)

    try {
      const res = await fetch('/api/winner/proof-upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (res.ok) {
        toast({ title: '✅ Proof uploaded successfully!', description: 'Waiting for admin verification' })
        if (onUploadComplete) onUploadComplete()
      } else {
        const data = await res.json()
        toast({ title: data.error || 'Upload failed', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Network error', variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  const getStatusInfo = () => {
    if (winner.verificationStatus === 'APPROVED') {
      return {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        label: 'APPROVED',
        message: 'Your proof has been verified!'
      }
    }
    if (winner.verificationStatus === 'REJECTED') {
      return {
        icon: AlertCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        label: 'REJECTED',
        message: 'Please upload a valid proof screenshot'
      }
    }
    if (winner.proofUrl) {
      return {
        icon: Clock,
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
        label: 'PENDING REVIEW',
        message: 'Admin is reviewing your proof'
      }
    }
    return {
      icon: Upload,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      label: 'ACTION REQUIRED',
      message: 'Please upload proof to claim your prize'
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="bg-gradient-to-br from-[#D4AF37]/10 to-[#0F5132]/10 backdrop-blur-xl border-2 border-[#D4AF37]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                🏆 You Won!
              </CardTitle>
              <CardDescription>
                {winner.matchTier.replace('_', ' ')} - ₹{winner.prizeAmount.toLocaleString()}
              </CardDescription>
            </div>
            <Badge className={`${statusInfo.bgColor} ${statusInfo.color} px-4 py-2 text-sm font-semibold`}>
              {statusInfo.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Status Alert */}
          <Alert className={statusInfo.bgColor}>
            <StatusIcon className={`h-5 w-5 ${statusInfo.color}`} />
            <AlertDescription className={statusInfo.color}>
              {statusInfo.message}
            </AlertDescription>
          </Alert>

          {/* Winning Numbers */}
          <div>
            <p className="text-sm text-[#2E2E2E]/60 mb-2">Your Winning Numbers:</p>
            <div className="flex gap-2">
              {JSON.parse(winner.userNumbers).map((num, idx) => (
                <div key={idx} className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#D4AF37]/70 flex items-center justify-center shadow-lg">
                  <span className="text-xl font-bold text-white">{num}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upload Section - Only show if not approved */}
          {winner.verificationStatus !== 'APPROVED' && (
            <div className="space-y-4 mt-6 pt-6 border-t border-[#0F5132]/20">
              <div>
                <h3 className="font-semibold text-[#2E2E2E] mb-2">Upload Proof Screenshot</h3>
                <p className="text-sm text-[#2E2E2E]/60 mb-3">
                  Upload a screenshot of your golf scores from the platform showing the winning numbers
                </p>
              </div>

              {/* File Preview */}
              {previewUrl && (
                <div className="relative rounded-lg overflow-hidden border-2 border-[#0F5132]/20">
                  <img src={previewUrl} alt="Proof preview" className="w-full h-64 object-contain bg-gray-50" />
                  {!winner.proofUrl && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-blue-600">New Upload</Badge>
                    </div>
                  )}
                </div>
              )}

              {/* Upload Controls */}
              {!winner.proofUrl || winner.verificationStatus === 'REJECTED' ? (
                <div className="flex gap-3">
                  <label className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-[#0F5132] text-[#0F5132] hover:bg-[#0F5132]/10"
                      onClick={() => document.getElementById('proofFile').click()}
                    >
                      <FileImage className="w-4 h-4 mr-2" />
                      {selectedFile ? 'Change File' : 'Select Screenshot'}
                    </Button>
                    <input
                      id="proofFile"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>

                  {selectedFile && (
                    <Button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="bg-[#0F5132] hover:bg-[#0F5132]/90 text-white px-8"
                    >
                      {uploading ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Submit Proof
                        </>
                      )}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Your proof is under review. We'll notify you once verified.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Payment Status */}
          {winner.verificationStatus === 'APPROVED' && (
            <div className="mt-6 pt-6 border-t border-[#0F5132]/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#2E2E2E]/60">Payment Status:</span>
                <Badge className={winner.paymentStatus === 'PAID' ? 'bg-green-600' : 'bg-amber-600'}>
                  {winner.paymentStatus}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
