import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Calendar, Image, MessageSquare } from 'lucide-react'

const NavLink = ({ to, icon: Icon, label }) => {
  const location = useLocation()
  const active = location.pathname === to
  return (
    <Link to={to} className={`flex flex-col items-center text-sm ${active ? 'text-pink-500' : 'text-gray-600'}`}>
      <Icon className="w-6 h-6" />
      <span className="mt-1">{label}</span>
    </Link>
  )
}

export default function Layout({ children }){
  return (
    <div className="min-h-screen pb-20">
      <main className="max-w-screen-sm mx-auto p-4">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-50 md:hidden">
        <div className="max-w-screen-sm mx-auto flex justify-around items-center py-2">
          <NavLink to="/" icon={Home} label="Início" />
          <NavLink to="/timeline" icon={Calendar} label="Timeline" />
          <NavLink to="/gallery" icon={Image} label="Galeria" />
          <NavLink to="/chat" icon={MessageSquare} label="Chat" />
        </div>
      </nav>
    </div>
  )
}
