import React from 'react'
import StockAvatar from './StockAvatar.jsx'

export default function Modal({ open, onClose, title, symbol, name, children }){
  if(!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="card w-[min(560px,92vw)]" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-2">
            {symbol && <StockAvatar symbol={symbol} name={name || title} />}
            <h3 className="modal-title">{title}</h3>
          </div>
          <button onClick={onClose} className="modal-close">✕</button>
        </div>
        <div className="mt-3">
          {children}
        </div>
      </div>
    </div>
  )
}
