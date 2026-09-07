'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageShell, { PageHero, SectionCard } from '../components/PageShell'
import { UploadCloud, CheckCircle, Loader2 } from 'lucide-react'

// Convert file to Base64
const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = (error) => reject(error);
  });

export default function CareersApplyPage({ jobId }) {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    experience: '',
    expectedPayout: '',
    resume: null,
  })

  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [captchaNum1, setCaptchaNum1] = useState(Math.floor(Math.random() * 10) + 1)
  const [captchaNum2, setCaptchaNum2] = useState(Math.floor(Math.random() * 10) + 1)
  const [userCaptcha, setUserCaptcha] = useState('')

  const validateField = (name, value) => {
    let error = ''
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) error = 'This field is required'
        break
      case 'email':
        if (!value) error = 'Email is required'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email address'
        break
      case 'phone':
        if (!value.trim()) error = 'Phone number is required'
        else if (value.replace(/\D/g, '').length < 10) error = 'Invalid phone number'
        break
      case 'experience':
        if (!value.trim()) error = 'Experience is required'
        break
      case 'resume':
        if (!value) error = 'Please upload your resume (PDF)'
        else if (value.type !== 'application/pdf') error = 'Only PDF files are allowed'
        else if (value.size > 5 * 1024 * 1024) error = 'File size must be less than 5MB'
        break
      default:
        break
    }
    return error
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target
    const val = files ? files[0] : value
    
    setFormData(prev => ({ ...prev, [name]: val }))
    
    // Real-time validation
    const error = validateField(name, val)
    setErrors(prev => {
      const newErrors = { ...prev }
      if (error) newErrors[name] = error
      else delete newErrors[name]
      return newErrors
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate all fields before submission
    const newErrors = {}
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key])
      if (error) newErrors[key] = error
    })
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    if (parseInt(userCaptcha) !== captchaNum1 + captchaNum2) {
      setErrors({ ...newErrors, captcha: 'Incorrect CAPTCHA answer' })
      return
    }

    setSubmitting(true)
    
    try {
      // 1. Convert Resume to Base64
      let fileData = ''
      let fileName = ''
      let mimeType = ''
      
      if (formData.resume) {
        fileData = await toBase64(formData.resume)
        fileName = formData.resume.name
        mimeType = formData.resume.type
      }

      // 2. Submit to Next.js API
      const apiRes = await fetch('/api/jobs/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          experience: formData.experience,
          expectedPayout: formData.expectedPayout,
          fileData,
          fileName,
          mimeType,
        }),
      })

      const apiData = await apiRes.json()
      
      if (!apiData.success) {
        throw new Error(apiData.error || "Failed to submit application")
      }

      setSuccess(true)
      
    } catch (err) {
      console.error(err)
      alert(err.message || "An unexpected error occurred. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <PageShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
          <div className="rounded-full bg-cyan-400/20 p-4 mb-6">
            <CheckCircle className="h-12 w-12 text-cyan-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Application Submitted!</h2>
          <p className="text-white/60 max-w-md mx-auto mb-8">
            Thank you for applying. We've received your application and resume. Our hiring team will review your profile and reach out if it's a match.
          </p>
          <button
            onClick={() => router.push('/careers')}
            className="rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            Back to Careers
          </button>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <PageHero
        eyebrow="Careers"
        title="Apply Now"
        subtitle="Fill out the form below to submit your application."
      />

      <section className="relative mx-auto max-w-2xl px-5 pb-16 md:px-8 md:pb-20">
        <SectionCard className="p-6 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full rounded-md border bg-black/40 px-4 py-2.5 text-white transition focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 ${errors.firstName ? 'border-red-500' : 'border-white/10'}`}
                />
                {errors.firstName && <p className="text-xs text-red-400 animate-in fade-in slide-in-from-top-1">{errors.firstName}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full rounded-md border bg-black/40 px-4 py-2.5 text-white transition focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 ${errors.lastName ? 'border-red-500' : 'border-white/10'}`}
                />
                {errors.lastName && <p className="text-xs text-red-400 animate-in fade-in slide-in-from-top-1">{errors.lastName}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full rounded-md border bg-black/40 px-4 py-2.5 text-white transition focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 ${errors.email ? 'border-red-500' : 'border-white/10'}`}
                />
                {errors.email && <p className="text-xs text-red-400 animate-in fade-in slide-in-from-top-1">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full rounded-md border bg-black/40 px-4 py-2.5 text-white transition focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 ${errors.phone ? 'border-red-500' : 'border-white/10'}`}
                />
                {errors.phone && <p className="text-xs text-red-400 animate-in fade-in slide-in-from-top-1">{errors.phone}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Total Experience</label>
              <input
                type="text"
                name="experience"
                placeholder="e.g. 5 Years in React & Node.js"
                value={formData.experience}
                onChange={handleChange}
                className={`w-full rounded-md border bg-black/40 px-4 py-2.5 text-white transition focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 ${errors.experience ? 'border-red-500' : 'border-white/10'}`}
              />
              {errors.experience && <p className="text-xs text-red-400 animate-in fade-in slide-in-from-top-1">{errors.experience}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Expected Payout <span className="text-white/40 font-normal">(Optional)</span></label>
              <input
                type="text"
                name="expectedPayout"
                placeholder="e.g. ₹20,00,000 / year"
                value={formData.expectedPayout}
                onChange={handleChange}
                className="w-full rounded-md border border-white/10 bg-black/40 px-4 py-2.5 text-white transition focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-sm font-medium text-white/80">Resume (PDF Only)</label>
              <div 
                className={`relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${errors.resume ? 'border-red-500 bg-red-500/5' : 'border-white/20 bg-white/5 hover:bg-white/10'}`}
              >
                <input
                  type="file"
                  name="resume"
                  accept="application/pdf"
                  onChange={handleChange}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                <UploadCloud className="mb-2 h-8 w-8 text-white/50" />
                <p className="text-center text-sm text-white/70">
                  {formData.resume ? (
                    <span className="font-medium text-cyan-400">{formData.resume.name}</span>
                  ) : (
                    <>
                      <span className="font-semibold text-cyan-400 hover:underline">Click to upload</span> or drag and drop
                    </>
                  )}
                </p>
                <p className="mt-1 text-xs text-white/40">Max size: 5MB</p>
              </div>
              {errors.resume && <p className="text-xs text-red-400 animate-in fade-in slide-in-from-top-1">{errors.resume}</p>}
            </div>

            <div className="space-y-2 pt-4 border-t border-white/10">
              <label className="text-sm font-medium text-white/80 flex items-center justify-between">
                <span>Security Check</span>
                <span className="text-cyan-400 font-mono bg-black/40 px-3 py-1 rounded">
                  {captchaNum1} + {captchaNum2} = ?
                </span>
              </label>
              <input
                type="text"
                value={userCaptcha}
                onChange={(e) => {
                  setUserCaptcha(e.target.value)
                  if (errors.captcha) {
                    setErrors(prev => ({ ...prev, captcha: '' }))
                  }
                }}
                placeholder="Enter the answer"
                className={`w-full rounded-md border bg-black/40 px-4 py-2.5 text-white transition focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 ${errors.captcha ? 'border-red-500' : 'border-white/10'}`}
              />
              {errors.captcha && <p className="text-xs text-red-400 animate-in fade-in slide-in-from-top-1">{errors.captcha}</p>}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center rounded-full bg-cyan-400 px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>
          </form>
        </SectionCard>
      </section>
    </PageShell>
  )
}
