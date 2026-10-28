import { useState } from 'react';
export default function NewsImage({ src, alt, ...props }) {
 const [failed, setFailed] = useState(false);
 return <img {...props} src={failed ? `${import.meta.env.BASE_URL}favicon.svg` : src} alt={alt} loading="lazy" decoding="async" onError={()=>setFailed(true)}/>;
}
