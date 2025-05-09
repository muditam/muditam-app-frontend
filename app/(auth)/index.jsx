import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import WelcomeScreen from '../screens/Welcome/WelcomeScreen';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return <WelcomeScreen />;
}
