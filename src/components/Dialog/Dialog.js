import React from 'react';
import './Dialog.css'

export function Dialog({ message }) {
  return (
    <div className="Dialog">
      <code>
        {message}
      </code>
    </div>
  )
}
