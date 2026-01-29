import React from 'react'
import { motion } from 'framer-motion'
import { twMerge } from 'tailwind-merge'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
  tone?: 'default' | 'safety'
}

export default function FlowButton({ className, variant = 'primary', tone = 'default', children, ...rest }: Props){
  const base = 'inline-flex items-center justify-center select-none border-2 bg-white text-ink shadow-hard-stop transition-transform'
  const toneCls = tone === 'safety' ? 'border-safety text-safety' : 'border-ink'
  const variantCls = variant === 'ghost' ? 'bg-transparent shadow-none' : ''

  return (
    <motion.button
      whileTap={{ x: 2, y: 2 }}
      transition={{ type: 'spring', stiffness: 700, damping: 30 }}
      className={twMerge(`${base} ${toneCls} ${variantCls} rounded-squircle-md px-3 py-1`, className)}
      {...(rest as any)}
      aria-pressed={rest['aria-pressed']}
    >
      {children}
    </motion.button>
  )
}
