export default function Button({ children, variant = 'primary', size = '', full = false, onClick, type = 'button', disabled = false }) {
  const classes = [
    variant === 'primary' ? 'btn-primary' : variant === 'ghost' ? 'btn-ghost' : 'btn-danger',
    size === 'sm' ? 'btn-sm' : '',
    full ? 'btn-full' : '',
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} onClick={onClick} type={type} disabled={disabled} style={disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>
      {children}
    </button>
  );
}
