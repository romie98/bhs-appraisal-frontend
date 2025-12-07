import { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import { Check } from 'lucide-react'

const EvidenceCheckboxList = forwardRef(function EvidenceCheckboxList({ 
  recommendedEvidence, 
  selectedEvidence, 
  onSelectionChange,
  showOther = true 
}, ref) {
  const [otherText, setOtherText] = useState('')
  const [isOtherSelected, setIsOtherSelected] = useState(false)

  // Expose validation method via ref
  useImperativeHandle(ref, () => ({
    isValid: () => selectedEvidence.length > 0,
    getSelectedEvidence: () => selectedEvidence
  }))

  const handleCheckboxChange = (evidenceItem, checked) => {
    const newSelection = checked
      ? [...selectedEvidence, evidenceItem]
      : selectedEvidence.filter(item => item !== evidenceItem)
    onSelectionChange(newSelection)
  }

  const handleOtherChange = (checked) => {
    setIsOtherSelected(checked)
    if (checked) {
      if (!selectedEvidence.includes('Other')) {
        onSelectionChange([...selectedEvidence, 'Other'])
      }
    } else {
      setOtherText('')
      onSelectionChange(selectedEvidence.filter(item => item !== 'Other'))
    }
  }

  const handleOtherTextChange = (value) => {
    setOtherText(value)
    // Update the "Other" entry in selectedEvidence with the custom text
    const otherIndex = selectedEvidence.indexOf('Other')
    if (otherIndex !== -1) {
      const newSelection = [...selectedEvidence]
      newSelection[otherIndex] = value ? `Other: ${value}` : 'Other'
      onSelectionChange(newSelection)
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Evidence Type <span className="text-red-500">*</span>
      </label>
      
      <div className="space-y-2">
        {recommendedEvidence.map((evidence, index) => {
          const isChecked = selectedEvidence.some(item => 
            item === evidence || item.startsWith(evidence)
          )
          
          return (
            <label
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div className="relative flex items-center justify-center mt-0.5 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => handleCheckboxChange(evidence, e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none checked:bg-blue-600 checked:border-blue-600"
                />
                {isChecked && (
                  <Check className="w-3 h-3 text-white absolute pointer-events-none" strokeWidth={3} />
                )}
              </div>
              <span className="text-sm text-gray-700 flex-1">{evidence}</span>
            </label>
          )
        })}

        {showOther && (
          <div className="space-y-2">
            <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="relative flex items-center justify-center mt-0.5 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={isOtherSelected}
                  onChange={(e) => handleOtherChange(e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none checked:bg-blue-600 checked:border-blue-600"
                />
                {isOtherSelected && (
                  <Check className="w-3 h-3 text-white absolute pointer-events-none" strokeWidth={3} />
                )}
              </div>
              <span className="text-sm text-gray-700 flex-1">Other</span>
            </label>
            
            {isOtherSelected && (
              <div className="ml-8">
                <textarea
                  value={otherText}
                  onChange={(e) => handleOtherTextChange(e.target.value)}
                  placeholder="Describe your evidence type..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {selectedEvidence.length === 0 && (
        <p className="text-xs text-red-500 mt-2">
          Please select at least one evidence type
        </p>
      )}
    </div>
  )
})

export default EvidenceCheckboxList

