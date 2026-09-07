'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PageShell, { PageHero, SectionCard } from '../components/PageShell'
import { UploadCloud, CheckCircle, Loader2, X } from 'lucide-react'
import { countryCodes, allCountries } from '../data/countries'

// Convert file to Base64
const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = (error) => reject(error);
  });

// Auto-resizing Textarea component
const AutoResizeTextarea = ({ className, ...props }) => {
  const textareaRef = useRef(null);

  const resize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  useEffect(() => {
    resize();
  }, [props.value]);

  return (
    <textarea
      ref={textareaRef}
      rows={1}
      onChange={(e) => {
        resize();
        if (props.onChange) props.onChange(e);
      }}
      className={`resize-none overflow-hidden ${className}`}
      {...props}
    />
  );
};

export default function CareersApplyPage({ jobId }) {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+1',
    phone: '',
    experience: '',
    expectedPayout: '',
    currentPayout: '',
    sponsor: '',
    legalStatus: '',
    citizenship: '',
    gender: '',
    agreedToTerms: false,
    resume: null,
  })

  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [captchaNum1, setCaptchaNum1] = useState(Math.floor(Math.random() * 10) + 1)
  const [captchaNum2, setCaptchaNum2] = useState(Math.floor(Math.random() * 10) + 1)
  const [userCaptcha, setUserCaptcha] = useState('')
  
  // Modal State
  const [modalType, setModalType] = useState(null) // 'terms' or 'privacy'

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
        else if (value.replace(/\D/g, '').length < 5) error = 'Invalid phone number'
        break
      case 'experience':
        if (!value.trim()) error = 'Experience is required'
        break
      case 'expectedPayout':
      case 'currentPayout':
      case 'sponsor':
      case 'legalStatus':
      case 'citizenship':
      case 'gender':
        if (!value.trim()) error = 'This field is required'
        break
      case 'agreedToTerms':
        if (!value) error = 'You must agree to the Terms and Privacy Policy'
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
    const { name, value, type, checked, files } = e.target
    const val = type === 'checkbox' ? checked : files ? files[0] : value
    
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
    
    if (!userCaptcha) {
      newErrors.captcha = 'Security check is required'
    } else if (parseInt(userCaptcha) !== captchaNum1 + captchaNum2) {
      newErrors.captcha = 'Incorrect answer'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      // Scroll to top to see errors if many
      window.scrollTo({ top: 0, behavior: 'smooth' })
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
          ...formData,
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
        subtitle={`Fill out the form below to submit your application.`}
        image="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000&q=80"
      />

      <section className="relative mx-auto max-w-2xl px-5 pb-16 md:px-8 md:pb-20">
        <SectionCard className="p-6 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* NAME */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">First Name</label>
                <AutoResizeTextarea
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full rounded-md border bg-black/40 px-4 py-2.5 text-white transition focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 ${errors.firstName ? 'border-red-500' : 'border-white/10'}`}
                />
                {errors.firstName && <p className="text-xs text-red-400 animate-in fade-in slide-in-from-top-1">{errors.firstName}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Last Name</label>
                <AutoResizeTextarea
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full rounded-md border bg-black/40 px-4 py-2.5 text-white transition focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 ${errors.lastName ? 'border-red-500' : 'border-white/10'}`}
                />
                {errors.lastName && <p className="text-xs text-red-400 animate-in fade-in slide-in-from-top-1">{errors.lastName}</p>}
              </div>
            </div>

            {/* EMAIL & PHONE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Email</label>
                <AutoResizeTextarea
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full rounded-md border bg-black/40 px-4 py-2.5 text-white transition focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 ${errors.email ? 'border-red-500' : 'border-white/10'}`}
                />
                {errors.email && <p className="text-xs text-red-400 animate-in fade-in slide-in-from-top-1">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Phone Number</label>
                <div className="flex gap-2">
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleChange}
                    className={`w-1/3 rounded-md border bg-black/40 px-2 py-2.5 text-white transition focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 border-white/10`}
                  >
                    {countryCodes.map((item, idx) => (
                      <option key={idx} value={item.code}>{item.code} {item.country}</option>
                    ))}
                  </select>
                  <AutoResizeTextarea
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-2/3 rounded-md border bg-black/40 px-4 py-2.5 text-white transition focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 ${errors.phone ? 'border-red-500' : 'border-white/10'}`}
                  />
                </div>
                {errors.phone && <p className="text-xs text-red-400 animate-in fade-in slide-in-from-top-1">{errors.phone}</p>}
              </div>
            </div>

            {/* CITIZENSHIP & GENDER */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Citizenship</label>
                <input
                  type="text"
                  name="citizenship"
                  list="countries"
                  value={formData.citizenship}
                  onChange={handleChange}
                  placeholder="Search country..."
                  className={`w-full rounded-md border bg-black/40 px-4 py-2.5 text-white transition focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 ${errors.citizenship ? 'border-red-500' : 'border-white/10'}`}
                />
                <datalist id="countries">
                  {allCountries.map((country, idx) => (
                    <option key={idx} value={country} />
                  ))}
                </datalist>
                {errors.citizenship && <p className="text-xs text-red-400 animate-in fade-in slide-in-from-top-1">{errors.citizenship}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`w-full rounded-md border bg-black/40 px-4 py-2.5 text-white transition focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 ${errors.gender ? 'border-red-500' : 'border-white/10'}`}
                >
                  <option value="" disabled>Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
                {errors.gender && <p className="text-xs text-red-400 animate-in fade-in slide-in-from-top-1">{errors.gender}</p>}
              </div>
            </div>

            {/* EXPERIENCE & PAYOUT */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Total Experience</label>
              <AutoResizeTextarea
                name="experience"
                placeholder="e.g. 5 Years in React & Node.js"
                value={formData.experience}
                onChange={handleChange}
                className={`w-full rounded-md border bg-black/40 px-4 py-2.5 text-white transition focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 ${errors.experience ? 'border-red-500' : 'border-white/10'}`}
              />
              {errors.experience && <p className="text-xs text-red-400 animate-in fade-in slide-in-from-top-1">{errors.experience}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Current Payout</label>
                <AutoResizeTextarea
                  name="currentPayout"
                  placeholder="e.g. ₹15,00,000 / year"
                  value={formData.currentPayout}
                  onChange={handleChange}
                  className={`w-full rounded-md border bg-black/40 px-4 py-2.5 text-white transition focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 ${errors.currentPayout ? 'border-red-500' : 'border-white/10'}`}
                />
                {errors.currentPayout && <p className="text-xs text-red-400 animate-in fade-in slide-in-from-top-1">{errors.currentPayout}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Expected Payout</label>
                <AutoResizeTextarea
                  name="expectedPayout"
                  placeholder="e.g. ₹20,00,000 / year"
                  value={formData.expectedPayout}
                  onChange={handleChange}
                  className={`w-full rounded-md border bg-black/40 px-4 py-2.5 text-white transition focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 ${errors.expectedPayout ? 'border-red-500' : 'border-white/10'}`}
                />
                {errors.expectedPayout && <p className="text-xs text-red-400 animate-in fade-in slide-in-from-top-1">{errors.expectedPayout}</p>}
              </div>
            </div>

            {/* LEGAL & SPONSORSHIP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-white/80 block">Are you legally authorized to work in this country?</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="legalStatus" value="Yes" onChange={handleChange} checked={formData.legalStatus === 'Yes'} className="peer hidden" />
                    <div className="w-5 h-5 rounded-full border border-white/20 peer-checked:border-cyan-400 peer-checked:bg-cyan-400/20 flex items-center justify-center transition-colors">
                      <div className={`w-2.5 h-2.5 rounded-full bg-cyan-400 transition-transform ${formData.legalStatus === 'Yes' ? 'scale-100' : 'scale-0'}`}></div>
                    </div>
                    <span className="text-white/80 peer-checked:text-white transition-colors">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="legalStatus" value="No" onChange={handleChange} checked={formData.legalStatus === 'No'} className="peer hidden" />
                    <div className="w-5 h-5 rounded-full border border-white/20 peer-checked:border-cyan-400 peer-checked:bg-cyan-400/20 flex items-center justify-center transition-colors">
                      <div className={`w-2.5 h-2.5 rounded-full bg-cyan-400 transition-transform ${formData.legalStatus === 'No' ? 'scale-100' : 'scale-0'}`}></div>
                    </div>
                    <span className="text-white/80 peer-checked:text-white transition-colors">No</span>
                  </label>
                </div>
                {errors.legalStatus && <p className="text-xs text-red-400 animate-in fade-in slide-in-from-top-1">{errors.legalStatus}</p>}
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium text-white/80 block">Do you need sponsorship in the future?</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="sponsor" value="Yes" onChange={handleChange} checked={formData.sponsor === 'Yes'} className="peer hidden" />
                    <div className="w-5 h-5 rounded-full border border-white/20 peer-checked:border-cyan-400 peer-checked:bg-cyan-400/20 flex items-center justify-center transition-colors">
                      <div className={`w-2.5 h-2.5 rounded-full bg-cyan-400 transition-transform ${formData.sponsor === 'Yes' ? 'scale-100' : 'scale-0'}`}></div>
                    </div>
                    <span className="text-white/80 peer-checked:text-white transition-colors">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="radio" name="sponsor" value="No" onChange={handleChange} checked={formData.sponsor === 'No'} className="peer hidden" />
                    <div className="w-5 h-5 rounded-full border border-white/20 peer-checked:border-cyan-400 peer-checked:bg-cyan-400/20 flex items-center justify-center transition-colors">
                      <div className={`w-2.5 h-2.5 rounded-full bg-cyan-400 transition-transform ${formData.sponsor === 'No' ? 'scale-100' : 'scale-0'}`}></div>
                    </div>
                    <span className="text-white/80 peer-checked:text-white transition-colors">No</span>
                  </label>
                </div>
                {errors.sponsor && <p className="text-xs text-red-400 animate-in fade-in slide-in-from-top-1">{errors.sponsor}</p>}
              </div>
            </div>

            {/* RESUME */}
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

            {/* CAPTCHA */}
            <div className="space-y-2 pt-4 border-t border-white/10">
              <label className="text-sm font-medium text-white/80 flex items-center justify-between mb-2">
                <span>Security Check</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="relative overflow-hidden rounded bg-black/60 border border-white/10 flex-shrink-0 h-[50px] w-[140px] flex items-center justify-center">
                  <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '4px 4px' }}></div>
                  <span className="relative z-10 text-cyan-400 font-mono text-xl tracking-widest font-bold select-none drop-shadow-md" style={{ transform: 'rotate(-2deg)' }}>
                    {captchaNum1} + {captchaNum2}
                  </span>
                  {/* Decorative noise lines */}
                  <div className="absolute top-1/4 left-0 w-full h-[1px] bg-cyan-400/30 transform rotate-12"></div>
                  <div className="absolute top-3/4 left-0 w-full h-[1px] bg-cyan-400/30 transform -rotate-6"></div>
                </div>
                <div className="flex-1 w-full">
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
                  {errors.captcha && <p className="text-xs text-red-400 mt-1 animate-in fade-in slide-in-from-top-1">{errors.captcha}</p>}
                </div>
              </div>
            </div>

            {/* TERMS & PRIVACY ANIMATED CHECKBOX */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-1">
                  <input 
                    type="checkbox" 
                    name="agreedToTerms" 
                    checked={formData.agreedToTerms} 
                    onChange={handleChange} 
                    className="peer hidden" 
                  />
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all duration-300 ${formData.agreedToTerms ? 'bg-cyan-400 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'bg-black/40 border-white/20 group-hover:border-white/40'} ${errors.agreedToTerms && !formData.agreedToTerms ? 'border-red-500 bg-red-500/10' : ''}`}>
                    <CheckCircle className={`w-3.5 h-3.5 text-black transition-transform duration-300 ${formData.agreedToTerms ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
                  </div>
                </div>
                <span className="text-sm text-white/70 leading-relaxed">
                  I agree to the <button type="button" onClick={() => setModalType('terms')} className="text-cyan-400 hover:underline">Terms and Conditions</button> and <button type="button" onClick={() => setModalType('privacy')} className="text-cyan-400 hover:underline">Privacy Policy</button>. I acknowledge that my data will be collected, stored, and used strictly for recruitment purposes, and I consent to receiving messages and calls regarding my application.
                </span>
              </label>
              {errors.agreedToTerms && <p className="text-xs text-red-400 mt-2 animate-in fade-in slide-in-from-top-1">{errors.agreedToTerms}</p>}
            </div>

            {/* SUBMIT */}
            <div className="pt-4">
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

      {/* MODAL OVERLAY */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-[#0f0f13] border border-white/10 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setModalType(null)} 
              className="absolute top-4 right-4 p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-semibold text-white mb-4 pr-8">
              {modalType === 'terms' ? 'Terms and Conditions' : 'Privacy & Data Security'}
            </h3>
            <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar text-white/70 text-sm space-y-4">
              {modalType === 'terms' ? (
                <>
                  <p>Welcome to Propnex AI.</p>
                  <p>By applying to a position with us, you agree to provide accurate, current, and complete information during the application process. You are responsible for ensuring that your resume and any other documents submitted are truthful and reflect your own work and qualifications.</p>
                  <p>We reserve the right to verify any information provided. Any false statements or misrepresentations may result in disqualification from consideration or immediate termination of employment if discovered after hire.</p>
                  <p>Applying to a role does not guarantee an interview or an offer of employment. Propnex AI retains the sole discretion to determine candidates who best meet the needs of the position.</p>
                </>
              ) : (
                <>
                  <p>Your privacy and data security are our top priorities.</p>
                  <p><strong>1. Data Collection:</strong> We collect personal data such as your name, contact details, resume, and employment history for the sole purpose of evaluating your candidacy for open roles at Propnex AI.</p>
                  <p><strong>2. Data Usage:</strong> Your data will be accessed exclusively by our HR and recruitment teams. We may use your phone number and email to contact you via SMS, calls, or emails regarding interview scheduling and application updates.</p>
                  <p><strong>3. Data Security:</strong> We employ industry-standard encryption and security measures to protect your application data from unauthorized access, alteration, or destruction.</p>
                  <p><strong>4. Data Retention:</strong> If your application is unsuccessful, we may retain your profile in our secure talent pool for up to 12 months to contact you regarding future opportunities, unless you explicitly request us to delete your data sooner.</p>
                </>
              )}
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <button 
                onClick={() => setModalType(null)}
                className="rounded-full bg-white/10 px-6 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Required for custom scrollbar in modal if needed, otherwise it falls back to default */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}} />
    </PageShell>
  )
}
