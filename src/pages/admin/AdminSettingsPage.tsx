import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { useSettings } from '@/context/SettingsContext'
import { updateSettings } from '@/lib/api/settings'
import { useToast } from '@/hooks/useToast'
import { AdminPageHeader, Card } from '@/components/admin/AdminPageHeader'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { Field, Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { LoadingBlock } from '@/components/ui/State'
import { Seo } from '@/components/ui/Seo'
import type { UploadResult } from '@/lib/api/storage'

export function AdminSettingsPage() {
  const { settings, refresh } = useSettings()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})

  useEffect(() => {
    if (settings) {
      setForm({
        photographer_name: settings.photographer_name ?? '',
        site_name: settings.site_name ?? '',
        tagline: settings.tagline ?? '',
        about_text: settings.about_text ?? '',
        intro: settings.intro ?? '',
        phone: settings.phone ?? '',
        email: settings.email ?? '',
        location: settings.location ?? '',
        whatsapp_number: settings.whatsapp_number ?? '',
        business_hours: settings.business_hours ?? '',
        facebook: settings.facebook ?? '',
        instagram: settings.instagram ?? '',
        twitter: settings.twitter ?? '',
        tiktok: settings.tiktok ?? '',
        youtube: settings.youtube ?? '',
      })
    }
  }, [settings])

  const set = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [profileUrl, setProfileUrl] = useState<string | null>(null)
  const [heroUrl, setHeroUrl] = useState<string | null>(null)

  useEffect(() => {
    if (settings) {
      setLogoUrl(settings.logo_url)
      setProfileUrl(settings.profile_photo_url)
      setHeroUrl(settings.hero_image_url)
    }
  }, [settings])

  if (!settings) {
    return <LoadingBlock label="Loading settings…" />
  }

  const handleLogo = (result: UploadResult) => setLogoUrl(result.image_url)
  const handleProfile = (result: UploadResult) => setProfileUrl(result.image_url)
  const handleHero = (result: UploadResult) => setHeroUrl(result.image_url)

  const validate = (): string | null => {
    if (!form.email || !/.+@.+\..+/.test(form.email)) {
      return 'Please enter a valid email address.'
    }
    if (form.whatsapp_number && !/^\d{6,15}$/.test(form.whatsapp_number)) {
      return 'WhatsApp number must be digits only, including country code (e.g. 15550123456).'
    }
    for (const key of ['facebook', 'instagram', 'twitter', 'tiktok', 'youtube']) {
      const value = form[key]
      if (value && !/^https?:\/\/.+/.test(value)) {
        return 'Social media links must start with http:// or https://'
      }
    }
    return null
  }

  const handleSave = async () => {
    if (saving) return
    const problem = validate()
    if (problem) {
      toast(problem, 'error')
      return
    }
    setSaving(true)
    try {
      await updateSettings({
        photographer_name: form.photographer_name,
        site_name: form.site_name,
        tagline: form.tagline,
        about_text: form.about_text,
        intro: form.intro,
        phone: form.phone,
        email: form.email,
        location: form.location,
        whatsapp_number: form.whatsapp_number,
        business_hours: form.business_hours,
        logo_url: logoUrl,
        profile_photo_url: profileUrl,
        hero_image_url: heroUrl,
        facebook: form.facebook || null,
        instagram: form.instagram || null,
        twitter: form.twitter || null,
        tiktok: form.tiktok || null,
        youtube: form.youtube || null,
      })
      await refresh()
      toast('Settings saved.')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Failed to save settings.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const SECTIONS: Array<{ title: string; fields: React.ReactNode }> = [
    {
      title: 'Identity',
      fields: (
        <div className="grid gap-5 sm:grid-cols-3">
          <ImageUploader value={logoUrl} onChange={handleLogo} folder="logos" aspectClassName="aspect-square" label="Logo" />
          <ImageUploader value={profileUrl} onChange={handleProfile} folder="avatars" aspectClassName="aspect-[4/5]" label="Profile photo" />
          <ImageUploader value={heroUrl} onChange={handleHero} folder="hero" aspectClassName="aspect-video" label="Hero image" />
        </div>
      ),
    },
    {
      title: 'Business details',
      fields: (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Photographer name">
            <Input value={form.photographer_name ?? ''} onChange={(e) => set('photographer_name', e.target.value)} />
          </Field>
          <Field label="Site name / brand">
            <Input value={form.site_name ?? ''} onChange={(e) => set('site_name', e.target.value)} />
          </Field>
          <Field label="Tagline">
            <Input value={form.tagline ?? ''} onChange={(e) => set('tagline', e.target.value)} />
          </Field>
          <Field label="Short intro" hint="Shown on the About section">
            <Input value={form.intro ?? ''} onChange={(e) => set('intro', e.target.value)} />
          </Field>
          <Field label="Phone" className="sm:col-span-1">
            <Input value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value)} />
          </Field>
          <Field label="Email" required>
            <Input type="email" value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} />
          </Field>
          <Field label="Location">
            <Input value={form.location ?? ''} onChange={(e) => set('location', e.target.value)} />
          </Field>
          <Field label="Business hours">
            <Input value={form.business_hours ?? ''} onChange={(e) => set('business_hours', e.target.value)} placeholder="e.g. Mon–Sat · 9 AM – 7 PM" />
          </Field>
        </div>
      ),
    },
    {
      title: 'About text',
      fields: (
        <Field label="Full biography" hint="Shown on the About page. Use blank lines to separate paragraphs.">
          <Textarea rows={8} value={form.about_text ?? ''} onChange={(e) => set('about_text', e.target.value)} />
        </Field>
      ),
    },
    {
      title: 'WhatsApp',
      fields: (
        <Field
          label="WhatsApp number"
          hint="Digits only, with country code — e.g. 15550123456. Leave empty to hide WhatsApp buttons."
        >
          <Input value={form.whatsapp_number ?? ''} onChange={(e) => set('whatsapp_number', e.target.value)} placeholder="15550123456" />
        </Field>
      ),
    },
    {
      title: 'Social media',
      fields: (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Instagram URL"><Input value={form.instagram ?? ''} onChange={(e) => set('instagram', e.target.value)} placeholder="https://instagram.com/…" /></Field>
          <Field label="Facebook URL"><Input value={form.facebook ?? ''} onChange={(e) => set('facebook', e.target.value)} placeholder="https://facebook.com/…" /></Field>
          <Field label="X / Twitter URL"><Input value={form.twitter ?? ''} onChange={(e) => set('twitter', e.target.value)} placeholder="https://x.com/…" /></Field>
          <Field label="TikTok URL"><Input value={form.tiktok ?? ''} onChange={(e) => set('tiktok', e.target.value)} placeholder="https://tiktok.com/@…" /></Field>
          <Field label="YouTube URL"><Input value={form.youtube ?? ''} onChange={(e) => set('youtube', e.target.value)} placeholder="https://youtube.com/…" /></Field>
        </div>
      ),
    },
  ]

  return (
    <>
      <Seo title="Settings" path="/admin/settings" />
      <AdminPageHeader
        title="Website Settings"
        description="Name, contact details, social links and imagery."
        action={
          <Button onClick={() => void handleSave()} loading={saving}>
            <Save className="h-4 w-4" /> Save settings
          </Button>
        }
      />

      <div className="mx-auto max-w-4xl space-y-6">
        {SECTIONS.map(({ title, fields }) => (
          <Card key={title} className="p-6">
            <h2 className="mb-5 font-display text-xl text-ink-900">{title}</h2>
            {fields}
          </Card>
        ))}
      </div>
    </>
  )
}