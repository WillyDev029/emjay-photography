import { COUNTRY_CODES, flagEmoji } from '@/lib/country-codes'
import { Input, Select } from './Input'

interface CountryPhoneInputProps {
  code: string
  number: string
  onCodeChange: (code: string) => void
  onNumberChange: (number: string) => void
  numberPlaceholder?: string
  autoComplete?: string
}

export function CountryPhoneInput({
  code,
  number,
  onCodeChange,
  onNumberChange,
  numberPlaceholder = '123 456 7890',
  autoComplete = 'tel-national',
}: CountryPhoneInputProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-[10.5rem_1fr]">
      <Select
        value={code}
        onChange={(e) => onCodeChange(e.target.value)}
        aria-label="Country code"
        className="truncate"
      >
        {COUNTRY_CODES.map((country) => (
          <option key={`${country.code}-${country.dial}`} value={country.dial}>
            {flagEmoji(country.code)} {country.name} {country.dial}
          </option>
        ))}
      </Select>
      <Input
        type="tel"
        value={number}
        onChange={(e) => onNumberChange(e.target.value)}
        placeholder={numberPlaceholder}
        autoComplete={autoComplete}
      />
    </div>
  )
}