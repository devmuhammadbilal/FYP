import React from 'react'

const FormField = ({ labelName, type, name, placeholder, value, handleChange, isSurpriseMe, handleSurpriseMe }) => {
  return (
    <div>
      <div className='flex items-center gap-2 mb-2'>
        <label
          htmlFor={name}
          className='block text-sm font-medium text-gray-900 '
        >
          {labelName}
        </label>
        {isSurpriseMe && (
          <button
            type='button'
            onClick={handleSurpriseMe}
            // UPDATED: Increased padding (py-1.5 px-3) for better mobile touch area
            className='font-semibold text-xs bg-[#ececf1] hover:bg-gray-200 transition-colors py-1.5 px-3 rounded-[5px] text-black'
          >
            Surprise Me
          </button>
        )}
      </div>
      <input
        type={type}
        id={name}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        required
        // UPDATED: Changed rounded-r-lg to rounded-lg (so all corners are rounded)
        // UPDATED: Added transition for focus state
        className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#4649ff] focus:border-[#4649ff] outline-none block w-full p-3 transition-all duration-200'
      />
    </div>
  )
}

export default FormField