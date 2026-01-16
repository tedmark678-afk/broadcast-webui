import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/control');
  }, [router]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: '#0f172a',
      color: '#06b6d4',
      fontSize: '18px',
      fontFamily: 'system-ui'
    }}>
      <p>Loading PTZ Control...</p>
    </div>
  );
}
