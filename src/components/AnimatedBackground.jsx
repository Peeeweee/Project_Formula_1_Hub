import { Component, lazy, Suspense, useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
const Paddock=lazy(()=>import('./animations/AmbientPaddock'));
class AmbientBoundary extends Component {state={failed:false};static getDerivedStateFromError(){return {failed:true};}render(){return this.state.failed?null:this.props.children;}}
export default function AnimatedBackground({path='/',enabled=true}) {
 const reduced=useReducedMotion();const [paused,setPaused]=useState(false);
 useEffect(()=>{const check=()=>setPaused(Boolean(document.querySelector('[role="dialog"]'))||document.hidden);const observer=new MutationObserver(check);observer.observe(document.body,{childList:true,subtree:true});document.addEventListener('visibilitychange',check);check();return()=>{observer.disconnect();document.removeEventListener('visibilitychange',check);};},[]);
 return <div aria-hidden="true" className="app-ambient"><div className="app-ambient-3d">{enabled&&!reduced&&<AmbientBoundary><Suspense fallback={null}><Paddock path={path} paused={paused}/></Suspense></AmbientBoundary>}</div></div>;
}
