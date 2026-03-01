'use client'

import { cn } from '@/lib/utils'
import { CONSTITUTION_INFO } from '@zhiwebing/shared'
import type { ConstitutionType } from '@zhiwebing/shared'

const CONSTITUTION_TYPES: ConstitutionType[] = [
  'BALANCED', 'QI_DEFICIENCY', 'YANG_DEFICIENCY', 'YIN_DEFICIENCY',
  'PHLEGM_DAMPNESS', 'DAMP_HEAT', 'BLOOD_STASIS', 'QI_STAGNATION', 'SPECIAL',
]

interface ConstitutionCheckboxGroupProps {
  value: ConstitutionType[]
  onChange: (value: ConstitutionType[]) => void
  className?: string
}

export function ConstitutionCheckboxGroup({ value, onChange, className }: ConstitutionCheckboxGroupProps) {
  const toggle = (type: ConstitutionType) => {
    if (value.includes(type)) {
      onChange(value.filter(t => t !== type))
    } else {
      onChange([...value, type])
    }
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {CONSTITUTION_TYPES.map(type => {
        const info = CONSTITUTION_INFO[type]
        const selected = value.includes(type)
        return (
          <button
            key={type}
            type="button"
            onClick={() => toggle(type)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors',
              selected
                ? 'border-herb-600 bg-herb-50 text-herb-700'
                : 'border-border bg-background text-muted-foreground hover:bg-muted'
            )}
          >
            <span>{info.icon}</span>
            <span>{info.name}</span>
          </button>
        )
      })}
    </div>
  )
}
