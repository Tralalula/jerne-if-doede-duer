import { useMediaQuery } from 'react-responsive';

export default function useIsMobile(): boolean {
    const isMobile = useMediaQuery({ query: '(max-width: 1000px)' });
    return isMobile;
  }
  
  