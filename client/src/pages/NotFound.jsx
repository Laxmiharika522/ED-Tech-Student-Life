import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16,textAlign:'center',padding:24}}>
      <div style={{fontFamily:'var(--font)',fontSize:'7rem',fontWeight:800,color:'rgba(255,255,255,0.08)',lineHeight:1}}>404</div>
      <h1 style={{fontFamily:'var(--font)',fontSize:'1.5rem',fontWeight:700}}>Page not found</h1>
      <p style={{color:'var(--w60)',fontSize:'0.9rem'}}>The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn btn-purple">Go Home</Link>
    </div>
  )
}
