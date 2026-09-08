'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PageShell, { PageHero, SectionCard } from '../components/PageShell'
import { UploadCloud, CheckCircle, Loader2, X } from 'lucide-react'
import { countryCodes, allCountries } from '../data/countries'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import ReCAPTCHA from 'react-google-recaptcha'

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
    countryCode: '+91',
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
  const [captchaToken, setCaptchaToken] = useState(null)
  
  // Modal State
  const [modalType, setModalType] = useState(null) // 'terms' or 'privacy'

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (modalType) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [modalType])

  const validateField = (name, value, currentFormData = formData) => {
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
        if (!value.trim()) {
          error = 'Phone number is required'
        } else {
          const fullNumber = currentFormData.countryCode + value;
          const phoneNumber = parsePhoneNumberFromString(fullNumber)
          if (!phoneNumber || !phoneNumber.isValid()) {
            error = 'Invalid phone number for the selected country'
          }
        }
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
    
    setFormData(prev => {
      const updated = { ...prev, [name]: val }
      // Real-time validation
      const error = validateField(name, val, updated)
      
      setErrors(errs => {
        const newErrors = { ...errs }
        if (error) newErrors[name] = error
        else delete newErrors[name]
        
        // If countryCode changes, revalidate phone
        if (name === 'countryCode' && updated.phone) {
          const phoneError = validateField('phone', updated.phone, updated)
          if (phoneError) newErrors.phone = phoneError
          else delete newErrors.phone
        }
        return newErrors
      })
      
      return updated
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate all fields before submission
    const newErrors = {}
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key], formData)
      if (error) newErrors[key] = error
    })
    
    if (!captchaToken) {
      newErrors.captcha = 'Please verify that you are not a robot'
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
        image="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=2000&q=80"
      />

      <section className="relative mx-auto max-w-6xl px-5 pb-16 md:px-8 md:pb-20">
        <SectionCard className="p-6 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* ROW 1: NAME & EMAIL */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">First Name</label>
                <AutoResizeTextarea
                  name="firstName"
                  placeholder="e.g. John"
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
                  placeholder="e.g. Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full rounded-md border bg-black/40 px-4 py-2.5 text-white transition focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 ${errors.lastName ? 'border-red-500' : 'border-white/10'}`}
                />
                {errors.lastName && <p className="text-xs text-red-400 animate-in fade-in slide-in-from-top-1">{errors.lastName}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Email</label>
                <AutoResizeTextarea
                  name="email"
                  placeholder="e.g. john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full rounded-md border bg-black/40 px-4 py-2.5 text-white transition focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 ${errors.email ? 'border-red-500' : 'border-white/10'}`}
                />
                {errors.email && <p className="text-xs text-red-400 animate-in fade-in slide-in-from-top-1">{errors.email}</p>}
              </div>
            </div>

            {/* ROW 2: PHONE, CITIZENSHIP & GENDER */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Phone Number</label>
                <div className="flex gap-2">
                  <input
                    name="countryCode"
                    list="countryCodes"
                    value={formData.countryCode}
                    onChange={handleChange}
                    placeholder="+1"
                    className={`w-[140px] shrink-0 rounded-md border bg-black/40 px-3 py-2.5 text-sm text-white transition focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 border-white/10`}
                  />
                  <datalist id="countryCodes">
                    {countryCodes.map((item, idx) => (
                      <option key={idx} value={item.code}>{item.country}</option>
                    ))}
                  </datalist>
                  <AutoResizeTextarea
                    name="phone"
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full rounded-md border bg-black/40 px-4 py-2.5 text-white transition focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 ${errors.phone ? 'border-red-500' : 'border-white/10'}`}
                  />
                </div>
                {errors.phone && <p className="text-xs text-red-400 animate-in fade-in slide-in-from-top-1">{errors.phone}</p>}
              </div>
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

            {/* ROW 3: EXPERIENCE, CURRENT PAYOUT, EXPECTED PAYOUT */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Current Payout (per year)</label>
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
                <label className="text-sm font-medium text-white/80">Expected Payout (per year)</label>
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
              <label className="text-sm font-medium text-white/80 block mb-2">
                Security Check
              </label>
              <div className="flex flex-col items-start">
                <div className="rounded overflow-hidden">
                  <ReCAPTCHA
                    sitekey="6LeS4K8tAAAAAFRQDzk_EK9UGQbvdQCHpaY6nJRc"
                    theme="dark"
                    onChange={(token) => {
                      setCaptchaToken(token)
                      if (errors.captcha) {
                        setErrors(prev => ({ ...prev, captcha: '' }))
                      }
                    }}
                  />
                </div>
                {errors.captcha && <p className="text-xs text-red-400 mt-2 animate-in fade-in slide-in-from-top-1">{errors.captcha}</p>}
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
