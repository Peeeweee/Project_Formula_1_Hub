import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Search, Menu, X, ArrowUpRight } from 'lucide-react';
import useDialogAccessibility from '../hooks/useDialogAccessibility';
import { PRIMARY_LINKS, RESOURCE_LINKS } from '../data/navigation';
import logo from '../assets/f1_logo.svg';
export default function SiteNavigation({onSearch}){
 const [open,setOpen]=useState(false),location=useLocation();
 const dialog=useDialogAccessibility(open,()=>setOpen(false));
 const links=(items,mobile=false)=>items.map(item=><NavLink key={item.path} to={item.path} end={item.path==='/'} onClick={()=>setOpen(false)} className={({isActive})=>`site-nav-link ${isActive?'is-active':''}`}><span>{item.label}</span>{mobile&&<small>{item.description}</small>}</NavLink>);
 return <><header className="site-header"><div className="site-brand-row"><NavLink to="/" className="site-brand" aria-label="Formula DC-1 home"><img src={logo} alt=""/><span>FORMULA <b>DC-1</b><small>YOUR WAY INTO FORMULA 1</small></span></NavLink><div className="site-header-actions"><button onClick={onSearch} aria-label="Search F1" className="site-search"><Search size={17}/><span>Search F1</span><kbd>⌘ / Ctrl K</kbd></button><button className="site-menu-toggle" aria-expanded={open} aria-controls="site-mobile-navigation" aria-label="Open navigation" onClick={()=>setOpen(true)}><Menu size={22}/></button></div></div><nav className="site-primary-nav" aria-label="Main navigation">{links(PRIMARY_LINKS)}</nav><nav className="site-resource-nav" aria-label="F1 resources"><span className="site-resource-label">GO DEEPER</span>{links(RESOURCE_LINKS)}<span className="site-current-context">{location.pathname==='/'?'A good place to begin':'Explore at your own pace'}</span></nav></header>
 {open&&<div className="site-mobile-backdrop"><section ref={dialog} role="dialog" aria-modal="true" aria-label="Site navigation" id="site-mobile-navigation" tabIndex={-1} className="site-mobile-menu"><div className="site-mobile-title"><strong>Find your next lap.</strong><button onClick={()=>setOpen(false)} aria-label="Close navigation"><X/></button></div><p>New to F1? Begin with Start Here. Every section is also ready to explore on its own.</p><nav aria-label="Mobile main navigation">{links(PRIMARY_LINKS,true)}</nav><h2>Go deeper <ArrowUpRight size={16}/></h2><nav aria-label="Mobile F1 resources">{links(RESOURCE_LINKS,true)}</nav></section></div>}</>;
}
