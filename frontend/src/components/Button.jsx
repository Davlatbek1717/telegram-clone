function Button({ children, loading, variant = 'primary', ...props }) {
  return (
    <button
      className={`btn btn-${variant} ${loading ? 'btn-loading' : ''}`}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <span className="spinner"></span>
      ) : (
        children
      )}
    </button>
  );
}

export default Button;
