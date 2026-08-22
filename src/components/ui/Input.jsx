// Reusable Input component
const Input = ({
  label,
  id,
  type = 'text',
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-surface-700"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`
          w-full px-4 py-2.5 rounded-lg border transition-all duration-200
          bg-white text-surface-800 placeholder-surface-400
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          ${error ? 'border-red-500' : 'border-surface-300'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;
