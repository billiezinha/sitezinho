import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Calendar, Image, Feather } from 'lucide-react'

const NavLink = ({ to, icon: Icon, label }) => {
  const location = useLocation()
  const active = location.pathname === to
  return (
    <Link to={to} className={`flex flex-col items-center justify-center gap-1 w-16 py-1 transition-colors ${active ? 'text-passion font-bold' : 'text-gray-400 hover:text-passion/70'}`}>
      <Icon className={`w-6 h-6 ${active ? 'stroke-[2.5px]' : 'stroke-2'}`} />
      <span className="text-[10px] uppercase tracking-wide">{label}</span>
    </Link>
  )
}

export default function Layout({ children }){
  return (
    <div className="min-h-screen pb-24">
      <main className="max-w-screen-sm mx-auto p-4">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-passion/10 z-50 md:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-screen-sm mx-auto flex justify-around items-center py-3">
          <NavLink to="/" icon={Home} label="Início" />
          <NavLink to="/timeline" icon={Calendar} label="Timeline" />
          <NavLink to="/gallery" icon={Image} label="Galeria" />
          <NavLink to="/poems" icon={Feather} label="Poemas" /> 
        </div>
      </nav>
    </div>
  )
}