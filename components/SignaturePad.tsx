"use client"

import React, { useRef, useImperativeHandle } from "react"
import SignatureCanvas from "react-signature-canvas"
import { Button } from "@/components/ui/button"

export interface SignaturePadRef {
  getDataURL: () => string | null
  clear: () => void
  isEmpty: () => boolean
}

interface SignaturePadProps {
  className?: string
}

export const SignaturePad = React.forwardRef<SignaturePadRef, SignaturePadProps>(
  function SignaturePad({ className }, ref) {
    const canvasRef = useRef<SignatureCanvas>(null)

    useImperativeHandle(ref, () => ({
      getDataURL() {
        if (!canvasRef.current || canvasRef.current.isEmpty()) return null
        return canvasRef.current.toDataURL("image/png")
      },
      clear() {
        canvasRef.current?.clear()
      },
      isEmpty() {
        return canvasRef.current?.isEmpty() ?? true
      },
    }))

    return (
      <div className={className}>
        <div className="rounded-lg border bg-white">
          <SignatureCanvas
            ref={canvasRef}
            canvasProps={{
              className: "w-full h-40 touch-none rounded-lg",
            }}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => canvasRef.current?.clear()}
        >
          Clear
        </Button>
      </div>
    )
  }
)
