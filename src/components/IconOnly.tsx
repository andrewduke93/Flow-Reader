import React from 'react'

export default function IconOnly({ children, size = 20 }: { children: React.ReactElement; size?: number }){
  return <span aria-hidden style={{ display: 'inline-flex', width: size, height: size }}>{React.cloneElement(children, { strokeWidth: 1.5, size })}</span>
}
